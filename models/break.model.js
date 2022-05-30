

const mongoose = require("mongoose");
const PostSchema = mongoose.Schema({
    dateBr: { type: Date },
    etat: { type: Boolean,default:true },
    categoryBr: [{ type: String }],
    availableSpots: { type: Number },
    pricePerSpot: { type: Number }    ,
    image: {
        data: Buffer,
        contentType: String
    }
});

const Post = mongoose.model("Break", PostSchema);
module.exports = Post;
