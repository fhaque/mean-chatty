var mongoose = require('mongoose');
var db_config = require('../config/db.js');

module.exports = function() {
    mongoose.connect(db_config.url);

    var models = {
        //User: mongoose.model('User', require('./models/user'), 'users'),
        Message: mongoose.model('Message', require('./models/message-no-user'), 'messages'),
    }

    return models;
}





