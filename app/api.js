var express = require('express');
var bodyparser = require('body-parser');
var models = require('./db')();

module.exports = function() {
    var api = express.Router();
    api.use(bodyparser.json());

    //post a new message
        //check if valid message
        //save message to DB
            //if media, store properly and return link to source
        //send socket event with message or media link

    //get n recent messages

    //get n recent images
    api.get('/recent-messages/:quantity', retrieveRecentMessages);
    api.get('/messages/', retrieveMessages);

    /*
    api.get('/*', function (req, res) {
        res.send('<h2>Hola!</h2>');
    });
    */
    return api;
}



function retrieveRecentMessages(req, res) {
    models.Message
        .find()
        .sort('-date')
        .limit(req.param.quantity)
        .select(['date','type','user','data','staticURL'])
        .select({ _id: 0 })
        .exec((err, data) => {
            if(err) {
                    res.json({});
                    console.log(`API error: Could not complete recentmessages query: ${err}`)
                } else {
                    res.json(data);
            }
        });
}

function retrieveMessages(req, res) {
    var date_range = setDateRange(req.query);
    var limit = parseInt(req.query.limit) || 0;

    models.Message
        .find({ date: date_range })
        .select(['date','type','user','data','staticURL'])
        .select({ _id: 0 })
        .sort('-date')
        .limit(limit)
        .exec((err, data) => {
            if(err) {
                    res.json({});
                    console.log(`API error: Could not complete messages query: ${err}`)
                } else {
                    res.json(data);
            }
        });
    
}

//TODO: Check if parameters are valid ISO dates or catch error in Date creation.
function setDateRange(params) {
    date_range = {
        $lte: ( () => { 
            if ( ("to" in params) && params.to !== '' ) {
                return new Date(params.to);
            }
            return new Date(); 
            

        })(),

        $gte: ( () => { 
            if ( ("from" in params) && params.from !== '' ) {
                return new Date(params.from);
            }
            return new Date(-8640000000000000);

        })(),

    };

    return date_range;
}