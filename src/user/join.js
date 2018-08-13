const database = require('../database');
const uuid = require('uuid/v4');

let userId = 1;

module.exports = function (socket, token) {
    let user;
    if (database.tokens.hasOwnProperty(token)) {
        const id = database.tokens[token];
        user = database.users[id];
    } else {
        token = uuid();
        userId++;
        database.tokens[token] = userId;
        user = database.users[userId] = {
            id: userId,
            drinks: 0,
            name: '',
            groups: []
        };
    }

    socket.emit('user.join', {
        user,
        token
    });

    user.groups.forEach(group => {
        socket.join(group);

        group = database.groups[group];

        if (!group.users.includes(user.id)) {
            group.users.push(user.id);
        }

        socket.emit('group.update', group);
    });

    const pushUsers = user.groups.reduce((value, id) => {
        const group = database.groups[id];
        return value.concat(group.users);
    }, []);

    Array.from(new Set(pushUsers)).forEach(id => {
        const user = database.users[id];
        socket.emit('user.update', user);
    });
};