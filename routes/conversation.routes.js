const express = require("express");
const conversationController = require('../controllers/conversation.controller');
const userController = require('../controllers/user.controller');

const router = express.Router()

router.route('/api/conversations/:userId')
  .get(conversationController.getConversations)

  router.route('/api/conversations/:userId/messages/:conversationId')
  .get(conversationController.getMessagesByConversationId)

  router.route('/api/conversations/search/:userId')
  .get(conversationController.searchConversations)

router.param('userId', userController.userByID)

module.exports = router;