const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
  text: String,
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = model("Message", MessageSchema);
