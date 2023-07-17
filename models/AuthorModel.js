const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");
const { Schema } = mongoose;

const authorSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
});

//virtuals
authorSchema.virtual("name").get(function () {
  return this.firstname + " " + this.lastname;
});
//encrypt password before save
authorSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified()) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
  } catch (e) {
    return next(e);
  }
});

const AuthorModel = mongoose.model("author", authorSchema);
module.exports = AuthorModel;
