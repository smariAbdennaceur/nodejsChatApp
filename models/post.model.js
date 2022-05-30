const mongoose = require("mongoose");
const PostSchema = mongoose.Schema({
  description: {
    type: String,
    maxLength: 3000,
  },
  like: {
    nblike: {
      type: Number,
      default: 0,
    },
    userslike: [{ userid: { type: mongoose.Schema.ObjectId, ref: "User" } }],
  },
  nbshare: {
    type: Number,
    default: 0,
  },
  image: [{
    data: Buffer,
    contentType: String,
  }],
  updated: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      idUser: { type: String },
      nameUser: { type: String },
      comment: {
        type: String,
        maxLength: 3000,
      },
    },
  ],
  owner: { type: mongoose.Schema.ObjectId, ref: "User" },
  v: { type: Boolean },
});

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
