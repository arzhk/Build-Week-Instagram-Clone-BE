const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    text: {
      type: String,
    },
    location: String,
    username: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },

    comments: [
      {
        type: new Schema(
          {
            user: {
              type: String,
            },
            text: {
              type: String,
            },
          },
          { timestamps: true }
        ),
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true,
  }
);

const PostSchema = model("posts", postSchema);

module.exports = PostSchema;
