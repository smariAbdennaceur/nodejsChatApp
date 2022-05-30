const express = require("express");
const marketCtrl = require('../controllers/market.controller');

const router = express.Router()

router.route('/api/market')
  .get(marketCtrl.list)


module.exports = router;