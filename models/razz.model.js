const mongoose = require("mongoose");
const RazzSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: 'Title is required'
    },
    information: {
        type: String,
        trim: true,
        required: 'Information is required'
    },
    category: {
        title: {
            type: String,
            required: 'Category title is required'
        },
        description: {
            type: String,
            required: 'Category description is required'
        },
        categoryId: { type: mongoose.Schema.ObjectId, ref: 'Category' }
    },
    availableSpots: {
        type: Number,
        required: "Available spots is required"
    },
    date: {
        type: Date,
        default: Date.now
    },
    pricePerSpot: {
        type: Number,
        required: "Price per spot is required"
    },
    isSponsored: {
        type: Boolean,
        default: false
    },
    image: {
        data: Buffer,
        contentType: String
    },
    bimg: {
        data: Buffer,
        contentType: String
    },
    country: {
        title: {
          type: String,
          //required: "Title is required",
        },
        countryId: { type: mongoose.Schema.ObjectId, ref: "Country" },
      },
    // TODO: uncomment for TRD-55
    // gallery: [{
    //     data: Buffer,
    //     contentType: String
    // }],
    condidats: [{
        idUser: { type: String }
    }],
    owner: { type: mongoose.Schema.ObjectId, ref: 'User' },    
    likes: [{
        idUser: { type: String }
    }]
})

const Razz = mongoose.model('Razz', RazzSchema);
module.exports = Razz;