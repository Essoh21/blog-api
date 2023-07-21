const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const userSchema = new Schema({
  user: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String, default: "", required: true },
  adminTrials: { type: Number, default: 0, required: true },
  isAuthenticatedAdmin: { type: Boolean, required: true, default: false },
});

//incrypt password before saving when password is set or modified
userSchema.pre("save", async function (next) {
  try {
    const user = this;
    if (!user.isModified("password")) next();
    //if password is modified
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

//add a method to check if user has a correct password
userSchema.methods.hasCorrectPassword = async function (password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
