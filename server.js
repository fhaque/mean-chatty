var express = require('express');
var http = require('http');
const path = require('path');

//create HTTP server that uses Express app as listener
var app = express();
var server = http.createServer(app);
server.app = app;

//Socket IO setup
var io = require('./app/socket')(server);

//connect to MongoDB database and return initialized models
var models = require('./app/db')();

//set port
var port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

//setup Routing
require('./app/routes')(app);

server.listen(port, function(error) {
    if (error) {
        console.log(`Port listening error: ${error}`);
    }
    console.log(`Listening to port: ${port}`);
});




module.exports = server;


