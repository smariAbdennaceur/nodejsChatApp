
const express = require('express')
const userCtrl = require('../controllers/user.controller')
const cardCtrl = require('../controllers/card.controller')


const router = express.Router()

// post card by user id
router.route('/api/cards/by/:userId')
  .post(cardCtrl.create)

// get all cards 
router.route('/api/cards')
  .get(cardCtrl.getAllCards)

// get  cards by owner id
router.route('/api/cards/by/:userId')
  .get(cardCtrl.cardByOwner)

router.route('/api/cards/:cardId')
  .get(cardCtrl.cardByID)

// get card logo by card id
router.route('/api/card/image/:cardId')
  .get(cardCtrl.photo)
  router.route('/api/card/bckimage/:cardId')
  .get(cardCtrl.bckimage)
// update card by cardId
router.route('/api/cards/:cardId')
  .put(cardCtrl.update)
  .delete(cardCtrl.remove)
router.route('/api/cards')
  .post(cardCtrl.amount)
router.route('/api/cards/like/:cardId/:userId')
  .put(cardCtrl.addlike)
  .delete(cardCtrl.rmlike)
router.param('userId', userCtrl.userByID)
router.param('cardId', cardCtrl.cardByID)


module.exports = router;