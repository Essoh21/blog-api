const mongoose = require("mongoose");
const { Schema } = mongoose;

const authorSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
});

//virtuals
postSchema.virtual("name").get(function () {
  return this.firstname + " " + this.lastname;
});

const AuthorModel = mongoose.model("author", authorSchema);
module.exports = AuthorModel;
