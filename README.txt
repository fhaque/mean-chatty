To run, 
1) Configure the Mongo database URI in the 'config/db.js' file.
2) Configure the upload directory location in the 'config/socket-upload.js' file.
3) Run 'node server.js' command in the project's directory.
4) On a local machine, the default URL is 'localhost:8080'

Note: There are console.log() calls throughout development. So you'd have to globally remove them.

--------------
TODO:
-Refactor code in general.
-Document data objects that are used by functions.
-Have the Uploads Gallery load older upload file thumbnails at the end of scroll.
-Apply MVC to the frontend. Maybe create a front-end framework version too.
-Security fixes in uploads: virus checking, executable checking, size check, file type check. This should happen on server-side too since front-end JS can be modified to send undefined object that can crash the server.
-Security fixes in text input: check for injection, limit number of Submits (also on server-side too).
-Uploads gallery thumbnails shoudl properly check that the image URLs are actual file type of images.
-Add User login and session.