const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DateTime } = require("luxon");

const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  dateTime: { type: Date, required: true, default: Date.now() },
  author: { type: Schema.Types.ObjectId, ref: "author" },
  comments: { type: Schema.Types.ObjectId, ref: "commnent" },
});

//virtuals
postSchema.virtual("dateTime_formatted").get(function () {
  return DateTime.fromJSDate(this.dateTime).toLocaleString(
    DateTime.DATETIME_SHORT // to format month date, year at hh:mm
  );
});

const PostModel = mongoose.model("post", postSchema);
module.exports = PostModel;
