const { Schema, model } = require("mongoose");

const ConversationSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "users", required: true },
    creator2: { type: Schema.Types.ObjectId, ref: "users", required: true },
    participants: [
      { type: Schema.Types.ObjectId, ref: "users", required: true },
    ],
    oneDay: { type: Boolean }, //dont understand this line of code
  },
  { timestamps: true }
);

module.exports = model("Conversation", ConversationSchema);
