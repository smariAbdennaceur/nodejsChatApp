const mongoose = require("mongoose");
const CardSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxLength: 75,
    required: "Title is required",
  },
  subtitle: {
    type: String,
    trim: true,
    required: "Subtitle is required",
  },
  information: {
    type: String,
    maxLength: 400,
    trim: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  bckImage: {
    data: Buffer,
    contentType: String,
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: "Price is required",
  },
  priceShipping: {
    type: Number,
    required: "Price shipping is required",
  },
  owner: { type: mongoose.Schema.ObjectId, ref: "User" },
  category: {
    title: {
      type: String,
      required: "Title is required",
    },
    description: {
      type: String,
    },
    categoryId: { type: mongoose.Schema.ObjectId, ref: "Category" },
  },
  country: {
    title: {
      type: String,
      required: "Title is required",
    },
    countryId: { type: mongoose.Schema.ObjectId, ref: "Country" },
  },
  isSponsored: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      idUser: { type: String },
    },
  ],
  buyers:[
    {type: mongoose.Schema.ObjectId, ref: "User" }
  ]
});


const Card = mongoose.model('Card', CardSchema);
module.exports = Card;