const express = require("express");
const bcrypt = require("bcrypt");
const { authenticate, verifyJWT } = require("../auth/tools");
const UserSchema = require("./schema");

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
      const isMatch = await bcrypt.compare(password ,user_byUsername.password);
      if (isMatch) {
        const token = await authenticate(user_byUsername);
        console.log(token.token);
        res
          .cookie("token", token.token, {
            httpOnly: true,
          })
          .send(user_byUsername);
      } else {
        next(await errorHandler("Invalid Email/Password", "" , 404));
      }
    } else {
      const user_byEmail = await UserSchema.findOne({ email: username });
      if (user_byEmail) {
        const isMatch = await bcrypt.compare(password, user_byEmail.password);
        if (isMatch) {
          const token = await authenticate(user_byEmail);
          console.log(token.token);
          res
            .cookie("token", token.token, {
              httpOnly: true,
            })
            .send(user_byEmail);
        } else {
          next(await errorHandler("Invalid Email/Password", "" , 404));
        }
      } else {
        next(await errorHandler("Invalid Email/Password", "" , 404));
      }
    }
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});

usersRouter.get("/login/homepage", async (req, res, next) => {
    try {
        const token = req.cookies.token
        const decodedToken = await verifyJWT(token)
        const user = await UserSchema.findOne({ _id: decodedToken._id })
        res.send(user)
    } catch (error) {
        console.log(error)
        next(await errorHandler(error))
    }
})

module.exports = usersRouter;
