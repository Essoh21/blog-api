const UserModel = require("../models/UserModel");
const CommentModel = require("../models/CommentModel");
const PostModel = require("../models/PostModel");
const AuthorModel = require("../models/AuthorModel");
const validation = require("../helpers/validation");
const passport = require("passport");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult, body, matchedData } = require("express-validator");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// create admin
exports.postAdminUser = [
  validation.createStringValidationChain("username", "invalid user name "),
  body("username")
    .trim()
    .custom(async (username) => {
      try {
        const user = await UserModel.findOne({ user: username });
        if (user) throw new Error("user exist. Login or try another username");
        return true;
      } catch (e) {
        throw new Error(e);
      }
    })
    .withMessage("user exist. Login or try another username"),
  validation.createPasswordValidationChain(body)(
    "password",
    "invalid password "
  ),
  async (req, res, next) => {
    const { username, password } = req.body;
    const errorsFromValidation = validationResult(req);
    const inputedDataIsValid = errorsFromValidation.isEmpty();
    if (!inputedDataIsValid) {
      return res
        .status(400)
        .json({ message: "invalid data", errors: errorsFromValidation.errors });
    }
    const user = new UserModel({ user: username, password: password });
    try {
      await user.save();
      res.status(200).json({
        message: "user is successfully saved",
        user: user.id,
      });
    } catch (e) {
      return res.status(502).json({ error: e });
    }
  },
];

//login as admin
exports.postLogin = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ user: username }).exec();
    if (!user) {
      return res.status(401).json({ message: "invalid username or password " });
    }
    const userIsAuthentic = await user.hasCorrectPassword(password);
    if (user.adminTrials > 3) return res.sendStatus(401);
    if (!userIsAuthentic) {
      const updatedUser = user.set("adminTrials", user.adminTrials + 1);
      await UserModel.findByIdAndUpdate(user._id, updatedUser);
      return res.status(401).json({ message: "invalid username or password " });
    }

    // when user login informations are correct create token and send the token :
    if (user.adminTrials > 0) {
      const updatedUser = user.set("adminTrials", 0);
      await UserModel.findByIdAndUpdate(user._id, updatedUser);
    }

    const token = jwt.sign({ user: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "5min",
    });
    const anotherOne = crypto.randomBytes(64).toString("hex");
    const updatedUser = user.set("refreshToken", anotherOne);
    await UserModel.findByIdAndUpdate(user._id, updatedUser);
    return res
      .status(200)
      .json({ message: "succesfull authentication", token, anotherOne });
  } catch (e) {
    return res.status(502).json({
      message: "login failed try  again",
      error: e,
    });
  }
};

// reading admin page
exports.getAdminPage = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const [authors, posts, comments] = await Promise.all([
        AuthorModel.find({}).exec(),
        PostModel.find({}).exec(),
        CommentModel.find({}).exec(),
      ]);
      res.status(200).json({ authors, posts, comments, user: req.user });
    } catch (e) {
      return res.sendStatus(502);
    }
  },
];
//refresh admin token
exports.postContinueSession = async (req, res, next) => {
  const { anotherOne } = req.body;
  if (!anotherOne) return res.sendStatus(400);
  try {
    const actualAdmin = await UserModel.findOne({
      refreshToken: anotherOne,
    }).exec();
    if (!actualAdmin) return res.sendStatus(403);
    // create new  token if admin is found
    const newToken = jwt.sign(
      { user: actualAdmin._id },
      process.env.TOKEN_SECRET,
      { expiresIn: "5min" }
    );
    return res
      .status(200)
      .json({ message: "successful refresh", token: newToken });
  } catch (e) {
    return res.sendStatus(502);
  }
};

// log admin out

exports.postAdminLogout = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(400);
  try {
    const actualAdmin = await UserModel.findOne({ refreshToken: refreshToken });
    if (!actualAdmin) return res.sendStatus(403);
    const logoutAdmin = actualAdmin.set("refreshToken", "");
    await UserModel.findByIdAndUpdate(actualAdmin._id, logoutAdmin);
    res.sendStatus(200);
  } catch (e) {
    return res.sendStatus(502);
  }
};
