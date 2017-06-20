
; (function(window) {

const gallery_to_chat_history_height_ratio = 0.8;

var $chat_view = $('chat-view');
var $history = $('#history');
var $upload_gallery = $('#uploads-gallery');

var $upload_gallery_header = $('#uploads-gallery_header');
var $upload_gallery_area = $('#uploads-gallery_area');

var $chat_form_textarea = $('#dragDrop > textarea');

var uploads_gallery_height_opened, uploads_gallery_height_closed;
    
$(document).ready(() => {
    $chat_form_textarea.empty();

    initializeUploadGallery();
    
    $(window).resize(function() {
        alignUploadGallery();
    });
});
    

    
function initializeUploadGallery() {
    //Set the closed and open heights of the gallery.

    alignUploadGallery();
    //uploads_gallery_height_opened = $upload_gallery.height();
    setUploadGalleryHeight() 
    
    $upload_gallery_area.hide();
    uploads_gallery_height_closed = $upload_gallery.height();
    $upload_gallery_area.show();

    setUploadGalleryClosed();
    
    //set the height
    $upload_gallery_header.click(toggleUploadGalleryClosedState);
    
    
}
    
function toggleUploadGalleryClosedState() {
    $upload_gallery_header.toggleClass('open');
    
    if ( $upload_gallery.isClosed ) {
        setUploadGalleryOpen();
    } else {
        setUploadGalleryClosed();   
    }
}
    
function setUploadGalleryClosed() {
    
    //$upload_gallery_area.hide();
    $upload_gallery.animate({height: uploads_gallery_height_closed}, {duration: 300, progress: alignUploadGallery});
    alignUploadGallery();
    
    $upload_gallery.isClosed = 1;
}
    
function setUploadGalleryOpen() {
    
    //$upload_gallery_area.show();
    $upload_gallery.animate({height: uploads_gallery_height_opened}, {duration: 300, progress: alignUploadGallery});
    alignUploadGallery();
    
    $upload_gallery.isClosed = 0;
}
    
function alignUploadGallery() {
    setSameInnerWidth($upload_gallery, $history);
    setUploadGalleryHeight() 
    alignLeftEdge($upload_gallery, $history);
    alignBottomEdge($upload_gallery, $history);
}

function setUploadGalleryHeight() {
    $upload_gallery.height( $chat_view.height() * gallery_to_chat_history_height_ratio );
    uploads_gallery_height_opened = $history.height() * gallery_to_chat_history_height_ratio;
}

function setSameInnerWidth(element, reference_element) {
    element.innerWidth(reference_element.outerWidth());
}
    
function alignLeftEdge(element, target_element) {
    element.offset({ left: target_element.offset().left, top: element.offset().top });
}
    
function alignBottomEdge(element, target_element) {
    element.offset({ top: target_element.offset().top + target_element.innerHeight() - element.innerHeight()
                    ,left: element.offset().left });
}

    
})(window);