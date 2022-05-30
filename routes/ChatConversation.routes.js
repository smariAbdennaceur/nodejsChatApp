const express = require("express");
const chatconversation = require('../models/ChatConversation.model');


const router = express.Router()
// new conv

router.post("/api/chatconversation", async (req, res) => {
    const newConversation = new chatconversation({
      members: [req.body.senderId, req.body.receiverId],
    });
  
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// remove conv 

router.delete('/api/chatconversation/:idConv', async (req, res) => {
  console.log('req ',req.params.idConv)
  try {
    let post = req.post
    let deletedConv = chatconversation.findByIdAndDelete(req.params.idConv)
    // console.log('deletedConv ',deletedConv)
    // deletedConv.remove();
     
    res.status(200).json({
        success:
            "deleted successfully"
    })
} catch (err) {
    return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
    })
}
})

// get conv
router.get("/api/chatconversation/:userId", async (req, res) => {
    try {
      const conversation = await chatconversation.find({
        members: { $in: [req.params.userId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // get conv
router.get("/api/conversationById/:idConv", async (req, res) => {
  try {
    const conversation = await chatconversation.findById(req.params.idConv);
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/api/findConversation/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await chatconversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    if(conversation){
      res.status(200).json(conversation)
    }else{
      const newConversation = new chatconversation({
        members: [req.params.firstUserId, req.params.secondUserId],
      });
      try {
        const savedConversation = await newConversation.save();
        const conversation = await chatconversation.findOne({
          members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(conversation);
      } catch (err) {
        res.status(500).json(err);
      }
    }
    
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;