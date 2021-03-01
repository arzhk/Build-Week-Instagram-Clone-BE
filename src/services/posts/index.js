const express = require("express");
const PostModel = require("../posts/schema");

const postsRouter = express.Router();

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body);
    await newPost.save();
    res.status(201).send("Post has been added.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = postsRouter;
