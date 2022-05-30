const express = require("express");
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const auctionCtrl = require('../controllers/auction.controller');

const router = express.Router()

router.route('/api/auctions')
  .get(auctionCtrl.listOpen)
router.route('/api/auctionsWithouImage')
  .get(auctionCtrl.listOpenwithouImage)

router.route('/api/auctions/bid/:userId')
  .get(auctionCtrl.listByBidder)

router.route('/api/auction/:auctionId')
  .get(auctionCtrl.read)

router.route('/api/auctions/by/:userId')
  .post(auctionCtrl.create)
  .get(auctionCtrl.listBySeller)

router.route('/api/auctions/:auctionId')
  .put(auctionCtrl.update)
  .delete(auctionCtrl.remove)

router.route('/api/auctions/image/:auctionId')
  .get(auctionCtrl.photo, auctionCtrl.defaultPhoto)

  router.route('/api/auctions/bckimage/:auctionId')
  .get(auctionCtrl.bckimage, auctionCtrl.defaultPhoto)
router.param('auctionId', auctionCtrl.auctionByID)
router.param('userId', userCtrl.userByID)

module.exports = router;