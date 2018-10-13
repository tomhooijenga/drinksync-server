const {PPM_PER_UNIT} = require("../consts");
const db = require('../database2');
const io = require('../socket');

// // permille per second
// // one glass per hour
// const rate = 0.2 / 3600;
// const timeout = 10;
// const processed = timeout * rate;
//
// setInterval(function () {
//     Object.values(database.users).forEach(user => {
//         user.permille = Math.max(0, user.permille - processed);
//
//         user.groups.forEach(id => {
//             io.to(id).emit('user.update', user);
//         })
//     });
// }, timeout * 1000);

module.exports = async function (socket, token, data) {
    const {drinks = 0, name} = data;

    const [user] = await db('user')
        .where('token', token)
        .update({
            name,
            drinks: drinks || undefined,
            ppm: !drinks
                ? undefined
                : db.raw('ppm + (? - drinks) * ?', [Math.max(0, drinks), PPM_PER_UNIT])
        })
        .returning(['id', 'name', 'drinks', 'ppm']);

    const joins = await db('group_user')
        .select('name')
        .innerJoin('group', 'group.id', '=', 'group_user.group_id')
        .where('user_id', user.id);

    socket.emit('user.update', user);

    joins.forEach(group => {
        io.to(group.name).emit('user.update', user);
    });
};