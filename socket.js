const Httpserver = require('./express');
const config = require('./config/config');
const User = require('./models/user.model');
const convController = require('./controllers/conversation.controller');

const io = require('socket.io')(Httpserver, {
  cors: {
    origin: config.url,
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
});
io.on('connection', async function (socket) {
  console.log('wajdi')
  const userId = socket.handshake.auth.userId;
  if (userId) {
    await User.findByIdAndUpdate(userId, { socketId: socket.id });
  }

  socket.on('SEND_MESSAGE', async ({ senderId, receiverId, message, conversationId }) => {
    console.log("SEND_MESSAGE", senderId, receiverId, message, conversationId);
    convController.sendMessage({ senderId, message, receiverId, conversationId, io });
  });
  socket.on('JOIN_ROOM', async ({ roomId, userId }) => {
    console.log('JOIN_ROOM', { roomId, userId });

    const user = await User.findById(userId).select('_id firstName lastName');
    if (!user) return;
    socket.join(roomId);
    io.to(roomId).emit('NEW_MESSAGE_IN_ROOM', {
      userId: user._id,
      user: `${user.firstName} ${user.lastName}`,
      message: `${user.firstName} ${user.lastName} joined the chat!`,
    });
  });

  socket.on('SEND_MESSAGE_ROOM', async ({ roomId, userId, message }) => {
    console.log('SEND_MESSAGE_ROOM', {  roomId, userId, message });
    const user = await User.findById(userId).select('_id firstName lastName');
    console.log(user)
    if (!user) return;
    io.to(roomId).emit('NEW_MESSAGE_IN_ROOM', {
      userId: user._id,
      user: `${user.firstName} ${user.lastName}`,
      message,
    });
  });

  socket.on('LEAVE_ROOM', async ({ roomId, userId }) => {
    const user = await User.findById(userId).select('_id firstName lastName');
    // console.log(user)
    if (!user) return;
    socket.join(roomId);
    io.to(roomId).emit('NEW_MESSAGE_IN_ROOM', {
      userId: user._id,
      user: `${user.firstName} ${user.lastName}`,
      message: `${user.firstName} ${user.lastName} left the chat!`,
    });
  });
});

module.exports = io;
