const express = require("express");
const userSchema = require("./schema");
const bcrypt = require("bcrypt");
const usersRouter = express.Router();
const cloudinary = require("../../cludinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagramProfile",
  },
});

const cloudinaryStorage = multer({ storage: storage });

usersRouter.post(
  "/:username",
  cloudinaryStorage.single("image"),
  async (req, res, next) => {
    try {
      const path = req.file.path;
      let response = await userSchema.findOneAndUpdate(
        { username: req.params.username },
        { img: path },
        { new: true }
      );
      res.status(201).send({ response });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = usersRouter;
