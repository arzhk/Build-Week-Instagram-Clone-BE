const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy
const UserModel = require("../users/schema")
const { authenticate } = require("../auth/tools")

passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: "http://localhost:3003/api/users/facebookRedirect",
        profileFields:["id","displayName","photos","email"]
       
      },
      async function (accessToken, refreshToken, profile, next) {
        console.log(profile);
        try {
          const user = await UserModel.findOne({
            email: profile.emails[0].value,
          });
          if (!user) {
              const [name,surname] = profile.displayName.split(" ")
            const newUser = {
              name,
              surname,
              username: profile.displayName,
              email: profile.emails[0].value,
              image: profile.photos[0].value,
              following:[],
              followers:[],
              refreshTokens:[],
            };
            console.log(newUser)
            const createdUser = new UserModel(newUser);
            console.log(createdUser)
            await createdUser.save();
            const token = await authenticate(createdUser);
            next(null, { user: createdUser, token });
          } else {
            const tokens = await authenticate(user);
            next(null, { user, tokens });
          }
        } catch (error) {
            console.log(error)
          next(error);
        }
      }
    )
  );
  passport.serializeUser(function (user, next) {
    next(null, user);
  });