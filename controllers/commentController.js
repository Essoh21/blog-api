const CommentModel = require("../models/CommentModel");
const UserModel = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const { validationResult, body, matchedData } = require("express-validator");

// Comment CRUD
// create comment
exports.postComment = [
  body("user")
    .trim()
    .notEmpty()
    .withMessage("empty name not allowed")
    .isLength({ min: 2, max: 20 })
    .withMessage("name must be at least 2 characters and at most 20 ")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("invalid email")
    .escape(),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("empty comments not allowed ")
    .isLength({ min: 3 })
    .withMessage("comment must have at least 3 characters"),
  asyncHandler(async (req, res, next) => {
    const errorFromValidation = validationResult(req);
    const inputedData = {
      user: req.body.user,
      email: req.body.email,
      comment: req.body.comment,
    };
    const dataFailedvalidation = !errorFromValidation.isEmpty();
    if (dataFailedvalidation) {
      return res
        .status(400)
        .json({ errors: errorFromValidation.errors, data: inputedData });
    }
    // if valid Data
    const validData = matchedData(req);
    const comment = new CommentModel({
      user: validData.user,
      email: validData.email,
      comment: validData.comment,
    });

    await comment.save();
    return res.status(200).json({ message: "ok", comment: comment._id });
  }),
];

// reading comment
exports.getComment = async (req, res, next) => {
  const commentId = req.params.commentid;
  try {
    const comment = await CommentModel.findById(commentId).exec();
    const commentIsNotFound = !comment;
    if (commentIsNotFound) return res.status(404).json({ comment });
    // when data is found, send data as response
    res.status(200).json({ comment });
  } catch (e) {
    res.status(400).json(e);
  }
};
exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await CommentModel.find({}).exec();
    return res.status(200).json({ comments: comments });
  } catch (e) {
    return res.status(400).json(e);
  }
};

// update comment
exports.getCommentUpdate = async (req, res, next) => {
  const commentId = req.params.commentid;
  try {
    const comment = await CommentModel.findById(commentId).exec();
    const commentNotFound = !comment;
    if (commentNotFound) return res.status(404).json(comment);
    return res.status(200).json({
      comment,
    });
  } catch (e) {
    return res.status(502).json({ error: e });
  }
};
exports.putCommentUpdate = [
  body("user")
    .trim()
    .notEmpty()
    .withMessage("empty comment not allowed")
    .isLength({ min: 4, max: 250 })
    .withMessage("comment must be at least 4 characters and at most 6 lines ")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("invalid email")
    .escape(),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("empty comments not allowed ")
    .isLength({ min: 3 })
    .withMessage("comment must have at least 3 characters")
    .escape(),
  async (req, res, next) => {
    const commentId = req.params.commentid;
    const errorsFromValidation = validationResult(req);
    const inputedData = {
      user: req.body.user,
      email: req.body.email,
      comment: req.body.comment,
    };

    const dataIsNotValid = !errorsFromValidation.isEmpty();
    if (dataIsNotValid) {
      return res
        .status(400)
        .json({ errors: errorsFromValidation.errors, data: inputedData });
    }
    // update data if valid data
    const validData = matchedData(req);
    const comment = new CommentModel({
      user: validData.user,
      email: validData.email,
      comment: validData.comment,
      _id: commentId,
    });
    // update valid data
    await CommentModel.findByIdAndUpdate(commentId, comment);
    return res.status(200).json({ comment });
  },
];

//deleting comment
exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.commentid;
  try {
    await CommentModel.findByIdAndDelete(commentId);
    return res.status(200).json({
      message: "successful deletion ",
    });
  } catch (e) {
    return res.status(502).json({ error: e });
  }
};
