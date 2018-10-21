const io = require('./socket')
const userActions = require('./user')
const groupActions = require('./group')

io.on('connection', function (socket) {
    socket.on('user.join', userActions.join.bind(null, socket));
    socket.on('user.update', userActions.update.bind(null, socket));

    socket.on('group.get', groupActions.get.bind(null, socket));
    socket.on('group.create', groupActions.create.bind(null, socket));
    socket.on('group.join', groupActions.join.bind(null, socket));
    socket.on('group.leave', groupActions.leave.bind(null, socket))
});