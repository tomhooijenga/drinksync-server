const http = require('http')

const port = process.env.PORT || 8080;
const app = http.createServer(function (req, res) {

    if (req.url === '/update-ppm') {
        console.log('Executing [/bin/update-ppm]')
        require('./bin/update-ppm')
    }

    res.writeHead(200);
    res.end('Ok');
});


app.listen(port);

module.exports = app;