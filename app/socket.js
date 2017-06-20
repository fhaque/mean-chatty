
var models = require('./db')();

module.exports = function(server) {
    var io = require('socket.io')(server);
    var uploader  = require('./socket-upload')(server.app);
    uploader.io = io;

    //add additional methods
    io.sendMessage = sendMessage.bind(io);
    io.sendFileLocationMessage = sendFileLocationMessage.bind(io);
    io.sendTextMessage = sendTextMessage.bind(io);
    io.handleMessageEvent = handleMessageEvent.bind(io);

    io.on('connection', function(socket) {
        uploader.listen(socket);
        
        console.log('Socket: User connected.');

        socket.on('message', io.handleMessageEvent);

        socket.on('disconnect', function() {
            console.log('Socket: User disconnected.')
        });
    });

    return io;
}

function handleMessageEvent(msg) {
    var msg_obj = JSON.parse(msg);
    var msg_to_send;

    var doc = new models.Message({type: "text", user: msg_obj.username, data: msg_obj.body});
    doc.save(err => {
        if (!err) {
            console.log("Socket message saved successfully.");
        } else {
            console.log("Socket message saving to DB error.");
        }
    });

    msg_to_send = doc.toObject();
    delete msg_to_send._id;
    this.sendTextMessage(JSON.stringify(msg_to_send));
}


function sendMessage(type, msg) {
    if (typeof msg === 'string') {
        this.emit(type, msg);
        console.log(`Socket: message emitted of type ${type}: ${msg}`);
        return true;
    } else {
        return false;
    }
}

function sendTextMessage(msg) {
    return this.sendMessage('message', msg);
}

function sendFileLocationMessage(msg) {
    return this.sendMessage('file-location', msg);
}

