const express = require("express");
const mongoose = require("mongoose");
const app = express();
const appRouter = require("./routes/router");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//connection to db
const dbURI = process.env.DB_URI;
main();
async function main() {
  try {
    await mongoose.connect(dbURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("successful connection to database ");
  } catch (e) {
    throw new Error(e);
  }
}

app.use(appRouter);
app.listen(process.env.PORT, () => {
  console.log("api running on port", process.env.PORT);
});
