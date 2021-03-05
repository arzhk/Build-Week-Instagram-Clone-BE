const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
  convoId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  content: { type: String, required: true },
  url: { type: String }, //dont understand this one
  sender: { type: Schema.Types.ObjectId, ref: "users", required: true },
  to: { type: Schema.Types.ObjectId, ref: "users" },
  like: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

module.exports = model("Message", MessageSchema);
