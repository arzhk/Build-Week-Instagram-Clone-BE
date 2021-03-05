const express = require("express");
const bcrypt = require("bcrypt");
const { authenticate, verifyJWT, refresh } = require("../auth/tools");
const UserSchema = require("./schema");
const passport = require("passport");
require("../auth/oauth");
const { authorize } = require("../auth/middleware");
const mongoose = require("mongoose");

const cloudinary = require("../../cludinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagramProfile",
  },
});

const cloudinaryStorage = multer({ storage: storage });

const usersRouter = express.Router();

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
    if (user_byUsername) {
      const isMatch = await bcrypt.compare(password, user_byUsername.password);
      if (isMatch) {
        const token = await authenticate(user_byUsername);
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

usersRouter.get("/me", authorize, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/updateInfo", authorize, async (req, res, next) => {
  try {
    const user = await UserSchema.findOneAndUpdate({ _id: req.user._id }, { ...req.body });
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/suggestions", authorize, async (req, res, next) => {
  try {
    const randomUsers = (await UserSchema.aggregate([{ $sample: { size: 5 } }])).filter(
      (user) => user._id.toString() !== req.user._id.toString()
    );

    console.log(randomUsers);
    res.send(randomUsers);
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

usersRouter.get("/facebookRedirect", passport.authenticate("facebook"), async (req, res, next) => {
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
});

usersRouter.get("/logout", async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.redirect("http://localhost:3000/login");
  } catch (error) {
    console.log("logout error: ", error);
    next(error);
  }
});

usersRouter.post("/picture/:username", cloudinaryStorage.single("image"), async (req, res, next) => {
  try {
    const path = req.file.path;
    let response = await UserSchema.findOneAndUpdate({ username: req.params.username }, { img: path }, { new: true });
    res.status(201).send({ response });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/follow/:id", authorize, async (req, res, next) => {
  try {
    const user = await UserSchema.findOne({ username: req.user.username });
    const indexOfFollowedUser = await user.following.findIndex(
      (user) => req.params.id.toString() === user._id.toString()
    );
    if (indexOfFollowedUser === -1) {
      await UserSchema.findByIdAndUpdate(user._id, {
        $addToSet: {
          following: req.params.id,
        },
      });
      await UserSchema.findByIdAndUpdate(req.params.id, {
        $addToSet: {
          followers: req.user._id,
        },
      });
    } else {
      await UserSchema.findByIdAndUpdate(user._id, {
        $pull: { following: req.params.id },
      });
      await UserSchema.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user._id },
      });
    }
    const updatedUser = await UserSchema.findOne({ username: req.user.username });
    res.status(200).send(updatedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/following", authorize, async (req, res, next) => {
  try {
    const user = await UserSchema.findOne({ username: req.user.username }).populate("following");
    res.send(user.following);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/followers", authorize, async (req, res, next) => {
  try {
    const user = await UserSchema.findOne({ username: req.user.username }).populate("followers");
    res.send(user.followers);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/search", authorize, async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    const users = await UserSchema.find();

    const users_filtered = await users.filter((user) =>
      user.username.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    res.send(users_filtered);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = usersRouter;
