const express = require("express");
const countryCtrl = require('../controllers/country.controller');

const router = express.Router()

router.route('/api/country')
  .get(countryCtrl.list)
  .post(countryCtrl.create)

router.route('/api/category/:countryId')
  .get(countryCtrl.countryByID)
 
router.param('countryId',countryCtrl.countryByID)

module.exports = router;