const express = require("express");
const chatMessage = require('../models/ChatMessage.model');


const router = express.Router()


//add

router.post("/api/chatMessage", async (req, res) => {
    const newMessage = new chatMessage(req.body);
  
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //get
  
  router.get("/api/chatMessage/:conversationId", async (req, res) => {
    try {
      const messages = await chatMessage.find({
        conversationId: req.params.conversationId,
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;