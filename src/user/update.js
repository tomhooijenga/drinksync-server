const database = require('../database');
const io = require('../socket');

// permille per second
// one glass per hour
const rate = 0.2 / 3600;
const timeout = 10;
const processed = timeout * rate;

setInterval(function () {
    Object.values(database.users).forEach(user => {
        user.permille = Math.max(0, user.permille - processed);

        user.groups.forEach(id => {
            io.to(id).emit('user.update', user);
        })
    });
}, timeout * 1000);

module.exports = function (socket, data) {
    if (!database.tokens.hasOwnProperty(data.token)) {
        return;
    }

    const id = database.tokens[data.token];
    const user = database.users[id];
    user.name = data.name || user.name;
    user.drinks += data.drinks || 0;
    user.drinks = Math.max(0, user.drinks);

    user.permille += data.drinks * 0.2 || 0;
    user.permille = Math.max(0, user.permille);

    user.groups.forEach(id => {
        io.to(id).emit('user.update', user)
    })
};