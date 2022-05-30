const express = require("express");
const userCtrl = require("../controllers/user.controller");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/api/users").get(userCtrl.list).post(userCtrl.create);

router.route("/api/verificationMailing").post(userCtrl.verificationMail);

router.route("/api/access").post(userCtrl.accesRestPw);

router.route("/api/resetpw").post(userCtrl.resetPw);
router.route("/api/editpw/:userId").put(userCtrl.editPw);
router.route("/api/verify/:code").get(userCtrl.cheking);
router
  .route("/api/users/:userId")
  .get(userCtrl.read)
  .put(userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);
router
  .route("/api/stripe_auth/:userId")
  .put(
    authCtrl.requireSignin,
    authCtrl.hasAuthorization,
    userCtrl.stripe_auth,
    userCtrl.update
  );

router.route("/api/user/image/:userId").get(userCtrl.photo);
router.route("/api/user/coverImage/:userId").get(userCtrl.coverPhoto);
router.route("/api/user/rate/:userId").put(userCtrl.rate);
router.route("/api/user/follow/:userId/:idF").put(userCtrl.follow);
router.route("/api/user/stripe/charge/:userId").post(userCtrl.createCharge);

router.route("/api/oneuser").get(userCtrl.getOneUser);

router.param("userId", userCtrl.userByID);

module.exports = router;
