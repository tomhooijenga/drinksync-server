const http = require('http')

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
const app = http.createServer(function (req, res) {
    res.writeHead(200);
    res.end('Ok');
});


app.listen(port);

module.exports = app;