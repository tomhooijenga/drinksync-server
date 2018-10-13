const server = require('./server');
module.exports = new require('socket.io')(server, {
    serveClient: false
});