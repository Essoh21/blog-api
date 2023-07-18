const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DateTime } = require("luxon");

const commentSchema = new Schema({
  user: { type: String, required: true },
  email: { type: String, required: true },
  comment: { type: String, required: true, minLength: 2 },
  dateTime: { type: Date, required: true, default: Date.now() },
});

//virtuals
commentSchema.virtual("dateTime_formatted").get(function () {
  return DateTime.fromJSDate(this.dateTime).toLocaleString(
    DateTime.DATETIME_SHORT // for formatting year, date at hh:mm
  );
});

const CommentModel = mongoose.model("comment", commentSchema);
module.exports = CommentModel;
