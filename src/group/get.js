const database = require('../database');

module.exports = function get(socket, id) {
    if (!database.groups.hasOwnProperty(id)) {
        return
    }

    const group = database.groups[id];
    socket.emit('group.update', group);
    group.users.forEach(id => {
        socket.emit('user.update', database.users[id]);
    })
};