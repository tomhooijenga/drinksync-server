const database = require('../database');
const generate = require('nanoid/generate');

module.exports = function (socket, token) {
    if (!database.tokens.hasOwnProperty(token)) {
        return;
    }

    const user = database.users[database.tokens[token]];

    let id = generate('0123456789', 6);
    while (database.groups.hasOwnProperty(id)) {
        id = generate('0123456789', 6);
    }

    const group = database.groups[id] = {
        id,
        users: [user.id]
    };
    user.groups.push(id);

    socket.join(id);
    socket.emit('user.update', user);
    socket.emit('group.update', group);
};