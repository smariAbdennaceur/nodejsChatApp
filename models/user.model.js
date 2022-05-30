const mongoose = require("mongoose");
const crypto = require("crypto");
const UserSchema = new mongoose.Schema({
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  coverPicture: {
    data: Buffer,
    contentType: String,
  },
  firstName: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  lastName: {
    type: String,
    trim: true,
    required: "Lastname is required",
  },
  postalCode: { type: String },
  adress: { type: String },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    required: "Email is required",
  },
  hashed_password: {
    type: String,
    required: "Password is required",
  },
  salt: String,
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  seller: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },

  code: {
    type: String,
    default: "",
  },
  rate: {
    type: String,
    default: "0",
  },
  rating: [
    {
      rate: {
        type: String,
        default: "0",
      },
      idUser: { type: mongoose.Schema.ObjectId, ref: "User" },
    },
  ],
  nbfollow: {
    type: Number,
    default: 0,
  },
  live:{
    type:Boolean,
    default:false
  },
  followers: [
    {
      idUser: { type: mongoose.Schema.ObjectId, ref: "User" },
    },
  ],
  stripe_seller: {},
  stripe_customer: {},
});

UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.path("hashed_password").validate(function (v) {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least 6 characters.");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required");
  }
}, null);

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
