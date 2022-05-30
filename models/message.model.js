const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  conversationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  seen: {
    type: Boolean,
    default: false,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    required: true
  }
})

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;