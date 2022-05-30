
const express = require('express')
const userCtrl = require('../controllers/user.controller')
const razzCtrl = require('../controllers/razz.controller')


const router = express.Router()

router.route('/api/razz/by/:userId')
  .post(razzCtrl.create)
router.route('/api/crRazz')
  .get(razzCtrl.list)
router.route('/api/razz/image/:razzId')
  .get(razzCtrl.photo)
router.route('/api/razz/Part')
  .post(razzCtrl.JoinRazz)
router.route('/api/razz/check/:razzId')
  .post(razzCtrl.amount)
router.route('/api/razzs/like/:razzId/:userId')
  .put(razzCtrl.addlike)
  .delete(razzCtrl.rmlike)
router.param('userId', userCtrl.userByID)
router.param('razzId', razzCtrl.razzById)


module.exports = router;