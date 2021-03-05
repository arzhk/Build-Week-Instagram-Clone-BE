const express = require("express");
const PostSchema = require("../posts/schema");
const cloudinary = require("../../cludinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { authorize } = require("../auth/middleware");
const UserSchema = require("../users/schema");
const mongoose = require("mongoose");

const postsRouter = express.Router();

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

// ROUTES FOR POSTS
// CREATES NEW POST
postsRouter.post("/", authorize, async (req, res, next) => {
  try {
    const newPost = new PostSchema(req.body);
    await newPost.save();
    res.status(201).send(newPost);
  } catch (error) {
    next(await errorHandler(error));
  }
});

// RETREIVES POSTS
postsRouter.get("/", authorize, async (req, res, next) => {
  try {
    const posts = await PostSchema.find().populate("user");
    res.status(200).send(posts);
  } catch (error) {
    next(await errorHandler(error));
  }
});

postsRouter.get("/following", authorize, async (req, res, next) => {
  try {
    const user = await UserSchema.findOne({ username: req.user.username }).populate("following");
    const posts = await PostSchema.find().populate("user");
    let posts_following = posts.filter(
      (post) => user.following.findIndex((userId) => post.user.toString() === userId.toString()) !== -1
    );
    /*
    posts_following.forEach(async (post) => {
      const postData = await PostSchema.findById(post._id);
      post._doc = { ...post._doc, comments: [...postData.comments] };
    });
    const test = [];

    posts_following.forEach((post) => test.push({ ...post }));
 */
    res.status(200).send(posts_following);
  } catch (error) {
    next(await errorHandler(error));
  }
});

postsRouter.get("/me", authorize, async (req, res, next) => {
  try {
    const posts = await PostSchema.find().populate("user");
    const posts_me = posts.filter((post) => post.username === req.user.username);
    res.status(200).send(posts_me.reverse());
  } catch (error) {
    next(await errorHandler(error));
  }
});

/* postsRouter.get("/following2", authorize, async (req, res, next) => {
  try {
    const posts = await PostSchema.aggregate([
      { $lookup: { localField: "user", from: "users", foreignField: "_id", as: "authorOfPost" } },
      { $lookup: { localField: "likes", from: "users", foreignField: "_id", as: "likesOfPost" } },
      { $match: { "authorOfPost.0.followers": mongoose.Types.ObjectId(req.user._id) } },
      { $project: { text: 1, user: 1, location: 1, username: 1, image: 1, comments: 1, likesOfPost: 1 } },
    ]);

    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});
 */
// RETREIVES THE SPESIFIC POST
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    res.status(200).send(post);
  } catch (error) {
    next(await errorHandler(error));
  }
});

// DELETES THE POST
postsRouter.delete("/:id", authorize, async (req, res, next) => {
  try {
    console.log("aaaadasdsa");
    const postToDelete = await PostSchema.findByIdAndDelete(req.params.id);
    if (!postToDelete || Object.values(postToDelete).length === 0) {
      const error = new Error(`There is no post with id ${req.params.id}`);
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(204).send({ msg: "Successfully Deleted Post" });
  } catch (error) {
    next(await errorHandler(error));
  }
});

// EDIT POST
postsRouter.put("/:id", authorize, async (req, res, next) => {
  try {
    const postToUpdate = await PostSchema.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!postToUpdate) {
      const error = new Error(`Post with id:${req.params.id} not found.`);
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(200).send(postToUpdate);
  } catch (error) {
    next(await errorHandler(error));
  }
});

// ADD IMG TO THE POST
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "instagramPost" },
});

const cloudinaryStorage = multer({ storage: storage });

postsRouter.post("/picture", cloudinaryStorage.single("image"), async (req, res, next) => {
  try {
    const path = req.file.path;
    /*  await PostSchema.findByIdAndUpdate(req.params.id, { image: path }, { runValidators: true, new: true }); */
    console.log(path);
    res.status(201).send({ path });
  } catch (error) {
    next(await errorHandler(error));
  }
});

// SUB ROUTES FOR COMMENTS
// CREATE COMMENTS
postsRouter.post("/:id/comments", authorize, async (req, res, next) => {
  try {
    const comment = req.body;
    const newComment = await PostSchema.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { runValidators: true, new: true }
    );
    res.status(201).send(newComment);
  } catch (error) {
    next(await errorHandler(error));
  }
});

// RETREIVES ALL THE COMMENTS FOR SPECIFIC POST
postsRouter.get("/:id/comments", authorize, async (req, res, next) => {
  try {
    const post = await PostSchema.findOne({ _id: req.params.id });
    res.status(200).send(post.comments);
  } catch (error) {
    next(await errorHandler(error));
  }
});

// RETREIVES SPECIFIC COMMENT BY ID
postsRouter.get("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const { comments } = await PostSchema.findById(req.params.id, {
      comments: { $elemMatch: { _id: req.params.commentId } },
    });
    res.status(200).send(comments[0]);
  } catch (error) {
    next(await errorHandler(error));
  }
});

// DELETES SPECIFIC COMMENT BY ID
postsRouter.delete("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const { comments } = await PostSchema.findByIdAndUpdate(req.params.id, {
      comments: { $pull: { _id: req.params.commentId } },
    });
    res.status(204).send({ message: "Comment has been deleted." });
  } catch (error) {
    next(await errorHandler(error));
  }
});

// UPDATE SPECIFIC COMMENT BY ID
postsRouter.put("/:id/comments/:commentId", async (req, res, next) => {
  let newText = req.body.text;

  try {
    let result = await PostSchema.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: { "comments.$[inner].text": newText },
      },
      {
        arrayFilters: [{ "inner._id": req.params.commentId }],
        new: true,
      }
    );
    if (!result) {
      return res.status(404);
    } else {
      res.status(204).send(result);
    }
  } catch (error) {
    next(await errorHandler(error));
  }
});

//SUB ROUTES FOR LIKES
//ADD LIKE TO POST

postsRouter.post("/:postId/like/:userId", authorize, async (req, res, next) => {
  try {
    const lookingForLike = await PostSchema.findOne({
      _id: req.params.postId,
      likes: req.params.userId,
    });
    if (lookingForLike) {
      await PostSchema.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: req.params.userId },
      });
      res.status(204).send("Removed Like");
    } else {
      await PostSchema.findByIdAndUpdate(req.params.postId, {
        $addToSet: { likes: req.params.userId },
      });
      res.status(200).send("Added Like");
    }
  } catch (error) {
    next(await errorHandler(error));
  }
});

module.exports = postsRouter;
