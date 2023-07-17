const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const userController = require("../controllers/userController");

router.get("/", (req, res) => {
  res.status(200).json({ name: "api" });
});
router.post("/author", authorController.postCreateAuthor);
module.exports = router;
// author
router.get("/author/:authorid", authorController.getAuthor);
router.get("/:authorid/update", authorController.getAuthorUpdate);
router.put("/:authorid/update", authorController.putAuthorUpdate);
router.delete("/authors/:authorid", authorController.deleteAuthor);
// user
router.post("/user", userController.postUser);
router.get("/users/:userid", userController.getUser);
router.get("/users/:userid/update", userController.getUserUpdate);
router.put("/users/:userid/update", userController.putUserUpdate);
router.delete("/user/:userid", userController.deleteUser);
