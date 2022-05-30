const mongoose = require("mongoose");

const ChatConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatConversation", ChatConversationSchema);
