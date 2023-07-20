const UserModel = require("../models/UserModel");
const CommentModel = require("../models/CommentModel");
const validation = require("../helpers/validation");
const bcrypt = require("bcryptjs");
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

exports.postLogin = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ user: username }).exec();
    if (!user) {
      return res.status(401).json({ message: "invalid username or password " });
    }
    const userIsAuthentic = await user.hasCorrectPassword(password);
    if (!userIsAuthentic) {
      return res.status(401).json({ message: "invalid username or password " });
    }
    // when user login informations are correct create token and send the token :
    const token = jwt.sign({ user: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "5min",
    });

    res.status(200).json({ message: "succesfull authentication", token });
  } catch (e) {
    return res.status(502).json({
      message: "login failed try  again",
      error: e,
    });
  }
};
