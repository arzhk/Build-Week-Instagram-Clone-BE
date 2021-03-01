const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    image: String,
    caption: String,
    likes: [{ type: Schema.Types.ObjectId, ref: "users" }],

    comments: [
      {
        text: String,
        user: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Post", postSchema);
