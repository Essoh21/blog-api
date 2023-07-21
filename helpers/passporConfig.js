const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const UserModel = require("../models/UserModel.js");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_SECRET,
};
const Strategy = new JwtStrategy(opts, async function (jwt_payload, done) {
  try {
    const user = await UserModel.findById(jwt_payload.user).exec();
    const { password, ...viewableInfo } = user;
    if (!user) {
      return done(null, false);
    }
    return done(null, viewableInfo);
  } catch (e) {
    return done(e, false);
  }
});

module.exports = (passport) => {
  passport.use(Strategy);
};
