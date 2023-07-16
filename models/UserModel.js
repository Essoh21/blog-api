const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (email) {
        const emailRegex = /[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return emailRegex.test(email);
      },
      message: (props) => {
        `${props.email} is not a valid email adress!`;
      },
    },
  },
});

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
