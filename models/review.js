const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./user');

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    date: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    username: String
})

module.exports = mongoose.model('Review', reviewSchema);