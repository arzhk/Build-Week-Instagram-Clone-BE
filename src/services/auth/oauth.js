const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy
const FacebookStrategy = require("passport-facebook").Strategy;
const UserModel = require("../users/schema")
const { authenticate } = require("../auth/tools")



passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:3000/googleRedirect",
      },
      async (request, accessToken, refreshToken, profile, next) => {
        const newUser = {
          googleId: profile.id,
          name: profile.name.givenName,
          surname: profile.name.familyName,
          email: profile.emails[0].value,
          role: "User",
          refreshTokens: [],
        }
  
        try {
          const user = await UserModel.findOne({ googleId: profile.id })
  
          if (user) {
            const tokens = await authenticate(user)
            next(null, { user, tokens })
          } else {
            const createdUser = new UserModel(newUser)
            await createdUser.save()
            const tokens = await authenticate(createdUser)
            next(null, { user: createdUser, tokens })
          }
        } catch (error) {
          next(error)
        }
      }
    )
  )

passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: "http://localhost:3003/facebookRedirect",
        profileFields: [
          "name",
          "surname",
          "image",
          "username",
          "email",
          "followers",
          "following",
        ],
      },
      async function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        try {
          const user = await UserModel.findOne({
            email: profile.emails[0].value,
          });
          if (!user) {
            const newUser = {
              name: profile.name.givenName,
              surname: profile.name.familyName,
              image: profile.photos[0].value,
              email: profile.emails[0].value,
              username: profile.username.value,
            };
            const createdUser = new UserModel(newUser);
            await createdUser.save();
            const token = await authenticate(createdUser);
            done(null, { user: createdUser, token });
          } else {
            const tokens = await authenticate(user);
            done(null, { user, tokens });
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
  passport.serializeUser(function (user, next) {
    next(null, user);
  });