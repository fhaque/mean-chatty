const UPLOADS_DIR = "/public/uploads";
const UPLOADS_PUBLIC_DIR = UPLOADS_DIR.split("/").pop();

module.exports = {
    maxFileSize: 10000000, //bytes
    emitChunkFail: true,
    uploadsPublicDir: UPLOADS_PUBLIC_DIR,
    dir: process.cwd() + UPLOADS_DIR
}