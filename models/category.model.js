const mongoose = require("mongoose");
const CategorydSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'Title is required'
    },
  
    description: {
      type: String
    }
})

const Category = mongoose.model('Category', CategorydSchema);
module.exports = Category;