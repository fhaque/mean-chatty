; (function (window) {
    
    
//Socket IO initialization
var socket = io();
var uploader = new SocketIOFileUpload(socket);
var user = {};

var chat_history = $('#history');
var uploads_gallery_area = $('#uploads-gallery_area');
var drag_drop = $('#dragDrop');
var chat_form = $('#chatForm');
var drag_drop_list = $('#dragDrop-list');

var all_messages = [];

drag_drop.fileNames = [];

var files = [];

//when Document is ready, get as many as 100 messages:
$(() => {
    chat_history.empty();
    setTimeout(getMessageHistory.bind(null, 30), 0);
    scrollChatHistoryToBottom();
});


//set up sockets
socket.on('message', processSocketMessage);

socket.on('file-location', processSocketMessage);
/*******************************************/
/*
*
User actions handling 
*
*/

//Drag and Drop actions for file upload
drag_drop.on('dragenter', function(e) {
    e.preventDefault();
    e.stopPropagation();
});
drag_drop.on('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();

    drag_drop.addClass('dragover');
});

drag_drop.on('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    drag_drop.removeClass('dragover');
    //retrieve dataTransfer object from JS's event object
    var dt = e.originalEvent.dataTransfer; 
    files.push(dt.files);

    handleFiles(dt.files);

});

drag_drop.on('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();

    drag_drop.removeClass('dragover');

});

drag_drop.on('dragend', function(e) {
    e.preventDefault();
    e.stopPropagation();

    drag_drop.removeClass('dragover');

});


//load older messages in chat history if scrolling up

var chat_history_scroll_timer = null;
chat_history.scroll(() => {
    if (chat_history_scroll_timer) {
        clearTimeout(chat_history_scroll_timer);
    }
    chat_history_scroll_timer = setTimeout( () => {
        var chat_history_scroll_ratio = chat_history.scrollTop() / chat_history[0].scrollHeight;
        if (chat_history_scroll_ratio <= 0.05) {
            getMessageHistory();
        }
    }, 300);
});

/*******************************************/
/*
*
On Submission
*
*/


chat_form.on('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var input_text = $('#message').val();

    //if new user, store the user name for messaging purposes
    if (!user.name) {
        user.name = $('#user').val();
        if (user.name === "") {
            user.name = makeid();
        }
        $('#user').hide();

        //add upload's event listener that adds user name for file
        uploader.addEventListener("start", function(e) {
            e.file.meta.username = user.name;
        });
    }

    msg_obj = { username: user.name, body: input_text };
    //send off text message
    if (input_text !== "") {
        socket.emit('message', JSON.stringify(msg_obj));
        $('#message').val('');
    }

    //upload files if there are any and clear dropbox area
    while (files.length > 0) {
        uploader.submitFiles(files.pop());
    }
    removeFileNames();
        

    return false;
});


/*******************************************/
/*
*
Helper functions
*
*/

function processSocketMessage(msg) {
    var msg_obj = JSON.parse(msg);
    msg_obj = createMessageObj(msg_obj);
    saveMessages(msg_obj, false);
    makeBubble(msg_obj, true);
    makeUploadsGalleryAreaFigure(msg_obj);
    scrollChatHistoryToBottom();
}

function scrollChatHistoryToBottom() {
    chat_history.animate({scrollTop: chat_history[0].scrollHeight + chat_history.css('padding-bottom')}, "slow");
}

function handleFiles(fileList) {
    var file_names = [];
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        file_names.push(file.name);
    }

    showFileNames(file_names);
}

function showFileNames(names) {
    var $p = $('<p>');
    
    if (names.constructor !== Array) {
        drag_drop.fileNames.push(names);
    } else {
        drag_drop.fileNames = drag_drop.fileNames.concat(names);
    }
    

    drag_drop_list.empty();
    drag_drop.fileNames.forEach((name) => {
        $p.append( $('<span>').text(name) );
    });

    drag_drop_list.append($p);
}

function removeFileNames() {
    drag_drop.fileNames = [];
    drag_drop_list.empty();
}

function makeUploadsGalleryAreaFigure(msg_obj, appendTo=false) {
    if ( msg_obj.type !== 'file' ) { return; }

    const file_url = "/" + msg_obj.body;
    const file_name = msg_obj.body.split("/").pop();

    var $uploads_gallery_area_figure = newEmptyUploadsGalleryAreaFigure();
    var $div = $uploads_gallery_area_figure.find('>:first-child').find('>:first-child');
    var $figcaption = $uploads_gallery_area_figure.find('>:first-child').find('>:last-child');
    
    if ( isImage(file_url) ) {
        $div.addClass('uploads-gallery_area_img');
        $div.css('background-image', `url("${file_url}")`);
    } else {
        $div.addClass('uploads-gallery_area_blank');
    }

    $uploads_gallery_area_figure.attr('href', file_url).attr('target','_blank');
    $figcaption.text(file_name);
    
    if ( appendTo ) {
        $uploads_gallery_area_figure.appendTo(uploads_gallery_area);
    } else {
        $uploads_gallery_area_figure.prependTo(uploads_gallery_area);
    }
    
}

function newEmptyUploadsGalleryAreaFigure() {
    var $a = $('<a>');
    
    var $figure = $('<figure>');
    $figure.append( $('<div>'), $('<figcaption>') );

    $a.append($figure);

    return $a;
}

//TODO: make this actually check content type
function isImage(src) {
    return(src.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

//Make Random string of 12 characters
//from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 12; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return "user-" + text;
}

function makeBubble(msg_obj, appendTo = true) {
    var bubble_element;

    if (msg_obj.type === "text"){
        bubble_element = makeTextBubbleElement(msg_obj);
    } else if (msg_obj.type === "file") {
        bubble_element = makeFileBubbleElement(msg_obj);
    }

    if ( appendTo ) {
        bubble_element.appendTo( chat_history ).hide().slideDown(500).fadeIn(300);
        
    } else {
        bubble_element.prependTo( chat_history ).hide().slideDown(500).fadeIn(300);
    }
    
}

function makeTextBubbleElement(msg_obj) {
    const username = msg_obj.username;
    var user_class = username === user.name ? 'bubble_user bubble_client-name' : 'bubble_user bubble_username';

    return $('<li>').append(`<span class="${user_class}">${msg_obj.username}</span> ${msg_obj.body}`);
}

function makeFileBubbleElement(msg_obj) {
    const username = msg_obj.username;
    const file_url = "/" + msg_obj.body;
    const file_name = msg_obj.body.split("/").pop();

    var user_class = username === user.name ? 'bubble_user bubble_client-name' : 'bubble_user bubble_username';

    return $('<li>').append(`<span class="${user_class}">${msg_obj.username}</span> <a class="bubble_link" href="${file_url}" target="_blank">${file_name}</a>`);
}

function createMessageObj(msg) {
    var msg_obj = {};

    msg_obj.date = msg.date;
    msg_obj.type = msg.type;

    if(msg.type === "text") {
        msg_obj.username = msg.user;
        msg_obj.body = msg.data;
    } else if (msg.type === "file") {
        msg_obj.username = msg.user;
        msg_obj.body = msg.staticURL; 
    }

    return msg_obj;
}

function saveMessages(msgs, appendTo = true) {
    if ( appendTo ) {
        if ( Array.isArray(msgs) ) {
            all_messages = all_messages.concat(msgs);
        } else {
            all_messages.push(msgs);
        }
    } else {
        if ( Array.isArray(msgs) ) {
            all_messages = msgs.concat(all_messages);
        } else {
            all_messages.unshift(msgs);
        }
    }
}

function getMessageHistory(quantity, toDate, fromDate) {
    quantity = quantity || 10;
    fromDate = fromDate || '';
    var toDate = toDate || '';

    if ( toDate === '' && all_messages.length > 0 ) {
        var toDate_obj = new Date(all_messages[all_messages.length - 1].date);
        toDate_obj.setUTCMilliseconds( toDate_obj.getUTCMilliseconds() - 1 );
        toDate = toDate_obj.toISOString();
    }

    const url = `${window.location.href}api/v1/messages/?from=${fromDate}&to=${toDate}&limit=${quantity}`;
    
    fetch(url)
    .then(resp => resp.json())
    .then(data => {
        if ( isEmptyObject(data) ) { data = []; }

        var messages = [];

        data.forEach((msg) => { messages.push(createMessageObj(msg)); }, this);
        saveMessages(messages);
        
        return messages;       
    })
    .then(msg_obj_array => {
        msg_obj_array  = msg_obj_array || [];
        msg_obj_array.forEach((msg_obj) => {
            makeBubble(msg_obj, false);
            makeUploadsGalleryAreaFigure(msg_obj, true);
        });
        
        if (all_messages.length === msg_obj_array.length) {
            scrollChatHistoryToBottom();
        }
    });

}
    
    

})(window);




