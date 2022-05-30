const mongoose = require("mongoose");
const ConversationSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    required: true,
    index: true
  },
  messages: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Message',
    default: [],
    index: true
  },
  updatedAt: {
      type: Date,
      default: Date.now,
      index: true
  }
})

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;