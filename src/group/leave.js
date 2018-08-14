const database = require('../database');
const io = require('../socket');

module.exports = function (socket, {id, token}) {
    if (!database.tokens.hasOwnProperty(token)) {
        return;
    }
    if (!database.groups.hasOwnProperty(id)) {
        return;
    }

    const group = database.groups[id];
    const user = database.users[database.tokens[token]];

    user.groups.splice(user.groups.indexOf(id), 1);
    group.users.splice(group.users.indexOf(user.id), 1);
    socket.leave(id);

    io.to(group.id).emit('user.update', user);
    io.to(group.id).emit('group.update', group);
};