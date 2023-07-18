const UserModel = require("../models/UserModel");
const CommentModel = require("../models/CommentModel");
const asyncHandler = require("express-async-handler");
const validation = require("../helpers/validation");
const { validationResult, body, matchedData } = require("express-validator");

//------------- User CRUD

// create  user
exports.postUser = [
  validation.createStringValidationChain("name", "invalid name"),
  validation.createEmailValidationChain("email", "invalid email"),
  asyncHandler(async (req, res, next) => {
    const errorsFromValidation = validationResult(req);
    if (!errorsFromValidation.isEmpty()) {
      const inputedData = {
        name: req.body.name,
        email: req.body.email,
      };
      return res
        .status(400)
        .json({ erro: errorsFromValidation.errors, data: inputedData });
    }
    // save valid data to db
    const validData = matchedData(req);
    const user = new UserModel({
      name: validData.name,
      email: validData.email,
    });
    await user.save();
    return res.status(200).json({
      user,
    });
  }),
];

// read user
exports.getUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.userid;
  // collect user Info from database
  const user = await UserModel.findById(userId).exec();
  if (!user) {
    return res.status(404).json({
      respons: " user not found ",
    });
  }
  // send use when he is found
  return res.status(200).json({ user });
});

//update user

exports.getUserUpdate = asyncHandler(async (req, res, next) => {
  const userId = req.params.userid;
  // get user from db
  const user = await UserModel.findById(userId);
  res.status(200).json({ user });
});

exports.putUserUpdate = [
  validation.createStringValidationChain("name", "invalid name"),
  validation.createEmailValidationChain("email", "invalid email"),
  asyncHandler(async (req, res, next) => {
    const userId = req.params.userid;
    const errorsFromValidation = validationResult(req);
    if (!errorsFromValidation.isEmpty()) {
      const inputedData = {
        name: req.body.name,
        email: req.body.email,
      };
      return res
        .status(400)
        .json({ error: errorsFromValidation, data: inputedData });
    }
    // save valid data to db
    const validData = matchedData(req);
    const user = new UserModel({
      name: validData.name,
      email: validData.email,
      _id: userId,
    });
    await UserModel.findByIdAndUpdate(userId, user);
    return res.status(200).json({ user });
  }),
];

// delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.userid;
  // don't delete user if he has some comments
  const allComments = await CommentModel.find({}).populate("user").exec();
  const userComments = allComments.filter(
    (comment) => comment.user._id + "" === userId + ""
  );
  const userhasComments = userComments.length > 0;
  if (userhasComments) {
    return res.status(403).json({
      userComments: userComments,
    });
  }

  // delete user if he does't have any comment
  await UserModel.findByIdAndDelete(userId);
  return res.status(200).json({ result: "successful deletion" });
});
