const express = require("express");
const postModel = require("../posts/schema");

const postsRouter = express.Router();

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new postModel(req.body);
    await newPost.save();
    res.status(201).send(newPost);
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

postsRouter.delete("/:id", async (req, res, next) => {
  try {
    const postToDelete = await postModel.findByIdAndDelete(req.params.id);
    res.status(204).send(postToDelete);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

postsRouter.put("/:id", async (req, res, next) => {
  try {
    const posttoEdit = await postModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    res.status(204).send(posttoEdit);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = postsRouter;
