const mongoose = require('mongoose');

const getSearchStringQuery = require('../helpers/getSearchStrinQuery');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');

const errorHandler = require('../helpers/dbErrorHandler');

function formatConversations(conversations = [], userId) {

  return conversations.map((c) => formatConv(c, userId));
}
const getConversations = async (req, res) => {
  const { skip = 0, limit = 20 } = req.query;
  let query = {
    participants: {
      $in: [req.profile._id],
    },
  };
  try {
    let conversations = await Conversation.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate([
        { path: 'participants', select: '_id firstName lastName email' },
        { path: 'messages', options: { sort: { createdAt: -1 }, limit , skip } },
      ])
      .lean();


    conversations = formatConversations(conversations, req.profile._id);

    res.status(200).json(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const searchConversations = async (req, res) => {
  const { skip = 0, limit = 20, search = '' } = req.query;
  let query = {
    participants: {
      $in: [req.profile._id],
    },
  };

  try {
    let conversations = await Conversation.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate([
        { path: 'participants', select: '_id firstName lastName email' },
        { path: 'messages', options: { sort: { createdAt: -1 }, limit: 1, skip: 0 } },
      ])
      .lean();


    if (conversations.length < limit) {
      const blacklistedIds = [req.profile._id.toString()];
      if (conversations.length > 0) {
        conversations.map((conversation) =>
          conversation.participants.map((p) => blacklistedIds.push(p._id.toString()))
        );
      }

      let userQuery = { _id: { $nin: blacklistedIds } };
      userQuery = getSearchStringQuery(['firstName', 'lastName'], search, userQuery);
      const users = await User.find(userQuery)
        .select('_id firstName lastName email')
        .skip(skip)
        .limit(limit - conversations.length)
        .lean();
      conversations = [...conversations, ...users];
    }

    conversations = formatConversations(conversations, req.profile._id);
    res.status(200).json(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const getMessagesByConversationId = async (req, res) => {
  const { conversationId } = req.params;
  const { skip = 0, limit = 40 } = req.query;
  try {
    let conversation = await Conversation.findById(conversationId)
      .populate([
        {
          path: 'messages',
          populate: { path: 'sender' },
          options: { sort: { createdAt: -1 }, skip: skip, limit: limit },
        },
      ])
      .sort({ updatedAt: -1 })
      .lean();

    if (conversation) {
      conversation.messages = conversation.messages.map((m) => {
        m.isSender = m.sender._id.toString() === req.profile._id.toString();
        return m;
      });
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const sendMessage = async ({ message, receiverId, senderId, conversationId, io }) => {
  try {
    let conversation, newMessage;
    const receiver = await User.findById(receiverId).select('socketId');

    if (!conversationId) {
      const conv = await Conversation.findOne({
        $or: [{ participants: { $eq: [senderId, receiverId] } }, { participants: { $eq: [receiverId, senderId] } }],
      })
        .select('_id')
        .lean();
      if (conv) conversationId = conv._id;
    }

    if (conversationId) {
      newMessage = await new Message({
        sender: senderId,
        message,
        conversationId,
      }).save();
      conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { messages: newMessage._id }, $set: { updatedAt: Date.now() } },
        { new: true }
      );
    } else {
      conversationId = new mongoose.Types.ObjectId();
      newMessage = await new Message({
        sender: senderId,
        message,
        conversationId,
      }).save();

      conversation = await new Conversation({
        _id: conversationId,
        participants: [senderId, receiverId],
        messages: [newMessage],
      }).save();
    }

    await newMessage.populate('sender', '_id firstName lastName email');

    conversation = {
      isConversation: true,
      conversationId: conversation._id,
      userId: senderId,
      user: newMessage.sender,
      lastMessage: newMessage,
    };

    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit('NEW_MESSAGE', { conversation, newMessage });
    }
    return { conversation, newMessage };
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = {
  getConversations,
  getMessagesByConversationId,
  sendMessage,
  searchConversations,
};

function formatConv(c, userId) {
  const isConversation = Array.isArray(c.participants) && Array.isArray(c.messages);
  if (isConversation && c.participants.length > 1) {
    c.participants = [...c.participants].filter((participant) => participant._id.toString() !== userId.toString());
  }

  return {
    isConversation,
    conversationId: isConversation ? c._id : null,
    userId: isConversation ? c.participants[0]._id : c._id,
    user: isConversation ? c.participants[0] : c,
    lastMessage: isConversation ? c.messages[0] : null,
  };
}
