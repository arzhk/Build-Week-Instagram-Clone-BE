const express = require("express");
const userSchema = require("./schema");
const bcrypt = require("bcrypt");
const { authenticate, verifyJWT } = require("../auth/tools");
const UserSchema = require("./schema");
const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = await UserSchema(req.body);
    const { _id } = await newUser.save();
    res.send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.findByCredentials(email, password);
    const token = await authenticate(user);
    console.log(token.token);
    res
      .cookie("token", token.token, {
        httpOnly: true,
      })
      .send({ message: "loged in" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = usersRouter;
