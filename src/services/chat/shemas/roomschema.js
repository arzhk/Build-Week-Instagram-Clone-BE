const { Schema, model } = require("mongoose");

const RoomSchema = new Schema({
  name: String,
  user1: { type: Schema.Types.ObjectId, ref: "users", required: true },
  user2: { type: Schema.Types.ObjectId, ref: "users", required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "users", required: true }],
});

module.exports = model("Room", RoomSchema);
