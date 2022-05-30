const mongoose = require("mongoose");
const Post = require("../models/break.model");
const RoomdSchema = new mongoose.Schema({
  title: { type: String },
  brodcaster: {
    name: {
      type: String,
    },
    idUser: {
      type: String,
    },
    rate: {
      type: String,
    },
  },
  category: { type: String },

  etat: { type: Boolean, default: true },

  viewers: [
    {
      name: {
        type: String,
        default: "",
      },
      idUser: {
        type: String,
        default: "",
      },
    },
  ],
  message: [
    {
      name: {
        type: String,
        default: "",
      },
      idUser: {
        type: String,
        default: "",
      },
      msg: {
        type: String,
        default: "",
      },
    },
  ],

 
  breaks:[{
    dateBr: { type: Date },
    categoryBr: { type: String },
    availableSpots: { type: Number },
    pricePerSpot: { type: Number },
    image: {
      data: Buffer,
      contentType: String,
    },
  
  }],

  banned: [{ type: String }],

  likesRomm: [
    {
      idUser: { type: String },
    },
  ],
});

const Room = mongoose.model("Room", RoomdSchema);
module.exports = Room;
