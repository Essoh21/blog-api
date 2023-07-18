const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const userController = require("../controllers/userController");
const commentController = require("../controllers/commentController");

router.get("/", (req, res) => {
  res.status(200).json({ name: "api" });
});
// author
router.post("/author", authorController.postCreateAuthor);
module.exports = router;
router.get("/author/:authorid", authorController.getAuthor);
router.get("/:authorid/update", authorController.getAuthorUpdate);
router.put("/:authorid/update", authorController.putAuthorUpdate);
router.delete("/authors/:authorid", authorController.deleteAuthor);
// user
router.post("/user", userController.postUser);
router.get("/users/:userid", userController.getUser);
router.get("/users/:userid/update", userController.getUserUpdate);
router.put("/users/:userid/update", userController.putUserUpdate);
router.delete("/users/:userid", userController.deleteUser);
// comment
router.post("/post/comment", commentController.postComment);
router.get("/comments/:commentid", commentController.getComment);
router.get("/comments/:commentid/update", commentController.getCommentUpdate);
router.put("/comments/:commentid/update", commentController.putCommentUpdate);
router.delete("/comments/:commentid", commentController.deleteComment);
