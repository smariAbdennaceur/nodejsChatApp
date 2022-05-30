const express = require("express");
const categoryCtrl = require('../controllers/category.controller');

const router = express.Router()

router.route('/api/category')
  .get(categoryCtrl.list)
  .post(categoryCtrl.create)

router.route('/api/category/:categoryId')
  .get(categoryCtrl.categoryByID)
 
router.param('categoryId',categoryCtrl.categoryByID)

module.exports = router;