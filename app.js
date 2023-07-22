const express = require("express");
const mongoose = require("mongoose");
const app = express();
const appRouter = require("./routes/router");
const passport = require("passport");
const passportConfig = require("./helpers/passporConfig");
const cors = require("cors");
//for production
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

passportConfig(passport);

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
app.use(helmet());
app.use(cors({ origin: process.env.LOCAL_HOST }));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(limiter);
app.use(appRouter);
app.listen(process.env.PORT, () => {
  console.log("api running on port", process.env.PORT);
});
