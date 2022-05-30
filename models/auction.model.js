const mongoose = require("mongoose");
const AuctionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: 'Item name is required'
  },
  subtitle: {
    type: String,
    trim: true,
    required: 'Item name is required'
  },
  information: {
    type: String,
    trim: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  bckImage: {
    data: Buffer,
    contentType: String,
},
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  bidStart: {
    type: Date,
    default: Date.now
  },
  bidEnd: {
    type: Date,
    required: "Auction end time is required"
  },
  ended:{type:Boolean,default:false},
  isSponsored: {
    type: Boolean,
    default: false,
  },
  category:
  {
    title: {
      type: String,
      required: 'Title is required'
    },
    description: {
      type: String
    },
    categoryId: { type: mongoose.Schema.ObjectId, ref: 'Category' }
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  likes: [{ idUser: { type: String } }],
  startingBid: { type: Number, default: 0 },
  safetyPrice: { type: Number, default: 0 },
  bids: [{
    bidder: { type: mongoose.Schema.ObjectId, ref: 'User' },
    bid: Number,
    time: Date
  }],
  price_Shipping: {
    type: Number,
    default: 0
  },
})

const Auction = mongoose.model('Auction', AuctionSchema);
module.exports = Auction;