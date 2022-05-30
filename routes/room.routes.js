const express = require("express");
const roomCtrl = require("../controllers/room.controller");

const router = express.Router();

router.route("/api/roomCrt").post(roomCtrl.create);

router
  .route("/api/roomCnv/:room")
  .post(roomCtrl.addMsg)
  .get(roomCtrl.getMsgByRoom);
router
  .route("/api/room/:room")
  .get(roomCtrl.getRoomById)
  .put(roomCtrl.stopLive);
//router.route("/api/room//:room").get(roomCtrl.roomByIDAndUser);
router.route("/api/room/user/:room").get(roomCtrl.details);
router.route("/api/rooms").get(roomCtrl.getRooms);
router.route("/api/room/image/:room").get(roomCtrl.photo);
router.route("/api/room/image/:room/:break").get(roomCtrl.photoOfBreak);
router.route('/api/room/like/:room/:userId')
  .put(roomCtrl.addlike)
router
  .route("/api/room/ban/:room/:iduser")
  .put(roomCtrl.banUser)
  .get(roomCtrl.isBanned);
router.route("/api/roomRecommended").get(roomCtrl.recomList);
router.param("room", roomCtrl.roomByID);

module.exports = router;
