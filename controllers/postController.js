const PostModel = require("../models/PostModel");
const CommentModel = require("../models/CommentModel");
const AuthorModel = require("../models/AuthorModel");

const { body, validationResult, matchedData } = require("express-validator");

//Post CRUD

//create Post
exports.postPost = [
  body("title")
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 150 })
    .withMessage(
      "title must be at least 10 characters and at most three lines"
    ),
  body("content").trim().notEmpty().isLength({ min: 20 }),
  async (req, res, next) => {
    const errorsFromvalidation = validationResult(req);
    const dataIsNotValid = !errorsFromvalidation.isEmpty();
    const authorId = req.params.authorid;
    const data = req.body;
    const inputedPost = {
      title: data.title,
      content: data.content,
    };
    if (dataIsNotValid) {
      return res.status(400).json({
        error: errorsFromvalidation.errors,
        data: inputedPost,
      });
    }
    const validData = matchedData(req);
    const post = new PostModel({
      title: validData.title,
      content: validData.content,
      author: authorId,
    });
    try {
      await post.save();
      return res.status(200).json({ post });
    } catch (e) {
      return res.status(502).json({
        error: e,
      });
    }
  },
];

// read post
exports.getPost = async (req, res, next) => {
  const postId = req.params.postid;
  try {
    const post = await PostModel.findById(postId).populate("author").exec();
    const postNotFound = !post;
    if (postNotFound) {
      return res.status(404).json({ message: "post not found" });
    }
    return res.status(200).json({ post });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};
// get  update post
exports.getPostUpdate = async (req, res, next) => {
  const postId = req.params.postid;
  try {
    const post = await PostModel.findById(postId).exec();
    return res.status(200).json({ post });
  } catch (e) {
    return res.status(502).json({ error: e });
  }
};

// put post update

exports.putPostUpdate = [
  body("title")
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 150 })
    .withMessage(
      "title must be at least 10 characters and at most three lines"
    ),
  body("content").trim().notEmpty().isLength({ min: 20 }).escape(),
  async (req, res, next) => {
    const postId = req.params.postid;
    try {
      const postToUpdate = await PostModel.findById(postId)
        .populate("author")
        .exec();
      if (!postToUpdate) {
        return res.status(404).json({ message: "post not found" });
      }
      const errorsFromvalidation = validationResult(req);
      const dataIsNotValid = !errorsFromvalidation.isEmpty();
      const data = req.body;
      const inputedPost = {
        title: data.title,
        content: data.content,
      };
      if (dataIsNotValid) {
        return res.status(400).json({
          error: errorsFromvalidation.errors,
          data: inputedPost,
        });
      }

      const validData = matchedData(req);
      const postUpdated = {
        title: validData.title,
        content: validData.content,
        author: postToUpdate.author._id,
        _id: postId,
      };

      await PostModel.findByIdAndUpdate(postId, postUpdated);
      return res.status(200).json({ post: postUpdated });
    } catch (e) {
      return res.status(502).json({
        error: e,
      });
    }
  },
];

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postid;
  try {
    await PostModel.findByIdAndDelete(postId).exec();
    return res.status(200).json({ message: "post deleted" });
  } catch (e) {
    return res.status(502).json({ message: "post not deleted " });
  }
};
