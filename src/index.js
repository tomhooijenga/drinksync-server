const io = require('./socket')
const userActions = require('./user')
const groupActions = require('./group')

io.on('connection', function (socket) {
    function call(fn) {
        return function () {
            return fn(socket, ...arguments);
        }
    }

    socket.on('user.join', call(userActions.join));
    socket.on('user.update', call(userActions.update));

    socket.on('group.get', call(groupActions.get));
    socket.on('group.create', call(groupActions.create));
    socket.on('group.join', call(groupActions.join));
    socket.on('group.leave', call(groupActions.leave))
});