const http = require('http')

const port = process.env.PORT || 8080;
const app = http.createServer(function (req, res) {

    if (req.url === '/update-ppm') {
        try {
            require('./bin/update-ppm')();
        } catch (e) {
            console.trace(e);
        }
    }

    res.writeHead(200);
    res.end('Ok');
});


app.listen(port);

module.exports = app;