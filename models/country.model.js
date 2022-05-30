const mongoose = require("mongoose");
const CountrySchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'Title is required'
    }
})

const Country = mongoose.model('Country', CountrySchema);
module.exports = Country;