const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    text: {
      type: String,
    },
    username: {
      type: String,
    },
    image: {
      type: String,
    },
    user: { type: Schema.Types.ObjectId, ref: "users" },

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
    likes: [
      {
        type: new Schema(
          {
            username: {
              type: String,
              required: true,
            },
            userId: {
              type: String,
              // required: true,
            },
            reaction: {
              type: Number,
              required: true,
              max: 1,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Post", postSchema);
