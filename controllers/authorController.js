const AuthorModel = require("../models/AuthorModel");
const validation = require("../helpers/validation");
const asyncHandler = require("express-async-handler");
const { validationResult, matchedData, body } = require("express-validator");
const PostModel = require("../models/PostModel");

// Author model CRUD
/**** creating author**  */
//validationchain
const validateFirstname = validation.createStringValidationChain(
  "firstname",
  "invalid firstname"
);
const validateLastname = validation.createStringValidationChain(
  "lastname",
  "invalid lastname"
);
const validatePassword = validation.createPasswordValidationChain(body)(
  "password",
  "invalid password"
);
exports.postCreateAuthor = [
  validateFirstname,
  validateLastname,
  validatePassword,
  async (req, res, next) => {
    const errorsFromvalidation = validationResult(req);
    const validData = matchedData(req);
    const inputedData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
    };

    if (!errorsFromvalidation.isEmpty()) {
      return res.status(400).json({
        data: inputedData,
        errors: errorsFromvalidation,
      });
    }

    //prepare data for save
    const author = new AuthorModel({
      firstname: validData.firstname,
      lastname: validData.lastname,
      password: validData.password,
    });

    await author.save();
    return res.status(200).json({
      status: " author saved",
    });
  },
];

//----------reading author

exports.getAuthor = asyncHandler(async (req, res, next) => {
  const authorid = req.params.authorid;
  const author = await AuthorModel.findById(
    authorid,
    "firstname lastname"
  ).exec();
  res.status(200).json(author);
});

exports.getAuthorUpdate = asyncHandler(async (req, res, next) => {
  const authorId = req.params.authorid;
  const author = await AuthorModel.findById(
    authorId,
    "firstname lastname"
  ).exec();
  res.status(200).json(author);
});

exports.putAuthorUpdate = [
  validation.createStringValidationChain("firstname", "invalid firstname"),
  validation.createStringValidationChain("lastname", "invalid lastname"),
  validation.createPasswordValidationChain(body)(
    "password",
    "invalid password"
  ),
  async (req, res, next) => {
    const authorId = req.params.authorid;
    const errorsFromvalidation = validationResult(req);
    const validData = matchedData(req);
    if (!errorsFromvalidation.isEmpty()) {
      return res.status(400).json({ errors: errorsFromvalidation });
    }
    // update data when data is valid
    const newAuthor = { ...validData, _id: authorId };
    await AuthorModel.findByIdAndUpdate(authorId, newAuthor);
    return res.status(200).json(newAuthor);
  },
];

// delete author

exports.deleteAuthor = asyncHandler(async (req, res, next) => {
  const authorId = req.params.authorid;
  //before deleting an author make sure the author doesn'nt have any post
  const allPosts = await PostModel.find({}).populate("author").exec();
  const authorPosts = allPosts.filter(
    (post) => post.author.id + "" === authorId + ""
  );
  const authorHavePosts = authorPosts.length < 1;
  if (authorHavePosts) {
    return res.status(403).json({ authorPosts: authorPosts });
  }

  // if author doesn't have posts then you can poced to delete author
  await AuthorModel.findByIdAndDelete(authorId);
  return;
});
