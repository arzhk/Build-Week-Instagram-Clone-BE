const express = require("express");
const postModel = require("../posts/schema");
const cloudinary = require("../../cludinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const postsRouter = express.Router();

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

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
    const post = await postModel.findById(req.params.id);
    if (post) {
      const postToDelete = await postModel.findByIdAndDelete(req.params.id);
      if (postToDelete) {
        res.status(204).send("Post has been deleted");
      } else {
        next(await errorHandler("", "", 500));
      }
    } else {
      next(
        await errorHandler(
          `Post with this id has not been found.`,
          req.params.id,
          404
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});

postsRouter.put("/:id", async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (post) {
      const postToEdit = await postModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { runValidators: true, new: true }
      );
      if (postToEdit) {
        res.status(204).send({ message: "Changes has been added" });
      } else {
        next(await errorHandler("", "", 500));
      }
    } else {
      next(
        await errorHandler(
          `Post with this id has not been found.`,
          req.params.id,
          404
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "instagramPost" },
});

const cloudinaryStorage = multer({ storage: storage });

postsRouter.post(
  "/:id",
  cloudinaryStorage.single("image"),
  async (req, res, next) => {
    try {
      const path = req.file.path;
      let post = await postModel.findByIdAndUpdate(
        req.params.id,
        { img: path },
        { new: true }
      );
      res.status(201).send({ post });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = postsRouter;
