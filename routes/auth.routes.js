const express = require("express");
const authCtrl = require ('../controllers/auth.controller');
const userCtrl = require ('../controllers/user.controller');

const router = express.Router()

router.route('/api/signin')
  .post(authCtrl.signin)
router.route('/api/signout')
  .get(authCtrl.signout)

module.exports = router;