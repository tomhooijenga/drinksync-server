const server = require('./server');
const io = require('socket.io')(server, {
    serveClient: false
});
const join = require('./user/join');
const database = require('./database')
const generate = require('nanoid/generate');

io.on('connection', function (socket) {
    socket.on('user.join', (token) => {
        join(socket, token);
    });

    socket.on('user.update', function (data) {
        if (!database.tokens.hasOwnProperty(data.token)) {
            return;
        }

        const id = database.tokens[data.token];
        const user = database.users[id];
        user.name = data.name || user.name;
        user.drinks = data.drinks || user.drinks;

        user.groups.forEach(group => {
            io.to(group).emit('user.update', user)
        })
    });

    socket.on('group.create', function (token) {
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
    });

    socket.on('group.join', function ({id, token}) {
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
    });

    socket.on('group.leave', function ({id, token}) {
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

        if (group.users.length === 0) {
            delete database.groups[id];
        } else {
            io.to(group.id).emit('user.update', user);
            io.to(group.id).emit('group.update', group);
        }
    })
});