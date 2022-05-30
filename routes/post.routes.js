const express = require("express");
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const postCtrl = require('../controllers/post.controller');
const catCtrl = require('../controllers/category.controller');

const router = express.Router()

router.route('/api/postCr/:userId')
  .post(postCtrl.create)
router.route('/api/posts')
  .get(postCtrl.list)

router.route('/api/post/:postId')
  .get(postCtrl.read)

router.route('/api/listByOwner/:userId')
  .get(postCtrl.listByOwner)

router.route('/api/posts/:postId')
  .put( postCtrl.update)
  .delete( postCtrl.remove)

router.route('/api/post/:postId/:userId')
  .put(postCtrl.addlike)
  .delete(postCtrl.rmlike)
router.route('/api/post/image/:postId')
  .get(postCtrl.photo)
  router.route('/api/post/comment/:postId')
  .post(postCtrl.addComment)
  .get(postCtrl.getComments)
router.route("/api/post/nbshare/:postId").post(postCtrl.incSharePost);

router.param('postId', postCtrl.postByID)
router.param('userId', userCtrl.userByID)
router.param('catId', catCtrl.categoryByID)

module.exports = router;
