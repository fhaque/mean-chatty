var siofu = require('socketio-file-upload');
const config = require('../config/socket-upload.js');

var models = require('./db')();

var fs = require('fs');

module.exports = function(app) {
    app.use(siofu.router);
    
    var uploader = new siofu();

    for (var key in config) {
        if (key in uploader) {
            uploader[key] = config[key];
        }
    }
    
    //file has been saved on server-side
    uploader.on("saved", handleSavedUploadedFile);

    uploader.on("error", handleError);

    return uploader;
}

function handleSavedUploadedFile(e) {
    if (e.file.success) {
        const file_name = e.file.pathName.split("/").pop();
        const file_path = config.uploadsPublicDir + "/" + file_name;
        const user = e.file.meta.username;

        //save to DB as a message
        doc = new models.Message({ type: "file", staticURL: file_path, user: user });
        doc.save((err, saved_doc) => {
            var msg_to_send;

            if(!err) {
                console.log(`File Uploader success!: ${file_name}`);

                msg_to_send = saved_doc.toObject();
                delete msg_to_send._id;
                this.io.sendFileLocationMessage(JSON.stringify(msg_to_send));

                //var msg = JSON.stringify({ username: user, body: file_path });
                //this.io.sendFileLocationMessage(msg);
            } else {
                fs.unlink(e.file.pathName);
                console.log(`File Uploader error: Couldn't save in DB: ${err}`);
            }
        });

        

    } else {
        console.log('File Uploader error: file had errors during saving.');
    }
}

function handleError(e) {
        console.log(`File Uploader error: ${e.error}`);
}