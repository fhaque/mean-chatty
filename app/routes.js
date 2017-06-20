const path = require('path'); 

module.exports = function(app) {
    app.use('/api/v1', require('./api')());
    
    app.get('*', function(req, res) {
        res.sendFile(process.cwd() + '/public/index.html');
    });

}