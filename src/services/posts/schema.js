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
  },
  {
    timestamps: true,
  }
);

module.exports = model("Post", postSchema);
