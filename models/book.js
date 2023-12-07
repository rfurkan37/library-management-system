const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required : true
    },
    quantity: {
        type : Number,
        default : 0
    },
    
    registerDate: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Book', bookSchema)