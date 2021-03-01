const express = require("express");
const postModel = require("../posts/schema");

const postsRouter = express.Router();

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new postModel(req.body);
    await newPost.save();
    res.status(201).send("Post has been added.");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await postModel.find();
    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = postsRouter;
