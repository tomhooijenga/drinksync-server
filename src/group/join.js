const database = require('../database');
const io = require('../socket');

module.exports = function (socket, {id, token}) {
    if (!database.tokens.hasOwnProperty(token)) {
        return;
    }
    if (!database.groups.hasOwnProperty(id)) {
        return;
    }

    const user = database.users[database.tokens[token]];
    const group = database.groups[id];

    if (!group.users.includes(user.id)) {
        group.users.push(user.id);
        user.groups.push(id);
        socket.join(id);
    }

    user.groups.forEach(group => {
        group = database.groups[group];
        io.to(group.id).emit('group.update', group);
    });

    const pushUsers = user.groups.reduce((value, id) => {
        const group = database.groups[id];
        return value.concat(group.users);
    }, []);

    Array.from(new Set(pushUsers)).forEach(id => {
        const user = database.users[id];
        socket.emit('user.update', user);
    });
}