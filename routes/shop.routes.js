const express = require("express");
const userCtrl = require ('../controllers/user.controller');
const authCtrl = require ('../controllers/auth.controller');
const shopCtrl = require ('../controllers/shop.controller');

const router = express.Router()

router.route('/api/shops')
  .get(shopCtrl.list)

router.route('/api/shop/:shopId')
  .get(shopCtrl.read)

router.route('/api/shops/by/:userId')
  .post(shopCtrl.create)
  .get(shopCtrl.listByOwner)

router.route('/api/shops/:shopId')
  .put(authCtrl.requireSignin, shopCtrl.isOwner, shopCtrl.update)
  .delete(authCtrl.requireSignin, shopCtrl.isOwner, shopCtrl.remove)

router.route('/api/shops/logo/:shopId')
  .get(shopCtrl.photo, shopCtrl.defaultPhoto)

router.route('/api/shops/defaultphoto')
  .get(shopCtrl.defaultPhoto)

router.param('shopId', shopCtrl.shopByID)
router.param('userId', userCtrl.userByID)

module.exports = router;
