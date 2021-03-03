const express = require("express");
const bcrypt = require("bcrypt");
const { authenticate, verifyJWT, refresh } = require("../auth/tools");
const UserSchema = require("./schema");
const passport = require("passport");
require("../auth/oauth");

const usersRouter = express.Router();
const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = await UserSchema(req.body);
    const { _id } = await newUser.save();
    res.send(_id);
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user_byUsername = await UserSchema.findOne({ username: username });
    console.log(user_byUsername);
    if (user_byUsername) {
      const isMatch = await bcrypt.compare(password, user_byUsername.password);
      if (isMatch) {
        const token = await authenticate(user_byUsername);
        console.log(token.token);
        res.cookie("token", token.token, {
          httpOnly: true,
        });
        res
          .cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            path: "/api/users/refreshToken",
          })
          .send(user_byUsername);
      } else {
        next(await errorHandler("Invalid Email/Password", "", 404));
      }
    } else {
      const user_byEmail = await UserSchema.findOne({ email: username });
      if (user_byEmail) {
        const isMatch = await bcrypt.compare(password, user_byEmail.password);
        if (isMatch) {
          const token = await authenticate(user_byEmail);
          console.log(token.token);
          res.cookie("token", token.token, {
            httpOnly: true,
          });
          res
            .cookie("refreshToken", token.refreshToken, {
              httpOnly: true,
              path: "/api/users/refreshToken",
            })
            .send(user_byEmail);
        } else {
          next(await errorHandler("Invalid Email/Password", "", 404));
        }
      } else {
        next(await errorHandler("Invalid Email/Password", "", 404));
      }
    }
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});

usersRouter.get("/refreshToken", async (req, res, next) => {
  try {
    console.log(req.cookies);
    const oldRefreshToken = req.cookies.refreshToken;

    const token = await refresh(oldRefreshToken);

    res.cookie("token", token.token, {
      httpOnly: true,
    });
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
      path: "/api/users/refreshToken",
    });
    res.send("OK");
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);

usersRouter.get(
  "/facebookRedirect",
  passport.authenticate("facebook"),
  async (req, res, next) => {
    try {
      res.cookie("token", req.user.tokens.token, {
        httpOnly: true,
      });
      res.cookie("refreshToken", req.user.tokens.refreshToken, {
        httpOnly: true,
        path: "/api/users/refreshToken",
      });
      res.status(200).redirect("http://localhost:3000/");
    } catch (error) {
      console.log(error);
      next(await errorHandler(error));
    }
  }
);

usersRouter.get("/logout", async (req, res, next) => {
  try {
    req.user.refreshTokens = [];
    await req.user.save();
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.send("OK");
  } catch (error) {
    console.log("logout error: ", error);
    next(error);
  }
});

module.exports = usersRouter;
