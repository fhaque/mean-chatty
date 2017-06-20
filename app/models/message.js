var mongoose = require('mongoose');

var User = require('./user');

module.exports = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        lowercase: true
    },

    date: {
        type: Date,
        required: true,
        default: Date.now
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    data: {
        type: String,
        default: ""
    }

    staticURL: {
        type: String,
        match: /^http:\/\//i
    }

});