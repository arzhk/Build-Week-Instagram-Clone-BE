const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    img: String,
    caption: String,
    likes: [{ type: Schema.Types.ObjectId, ref: "users" }],

    comments: [
      {
        text: String,
        username: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Post", postSchema);
