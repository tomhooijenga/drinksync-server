const {PPM_PER_UNIT} = require("../constants");
const db = require('../database2');
const io = require('../socket');

module.exports = async function (socket, token, data) {
    const update = {
        name: data.name
    };

    if (data.drinks !== undefined) {
        update.drinks = Math.max(0, data.drinks);
        update.ppm = update.drinks * PPM_PER_UNIT
    }

    const [user] = await db('user')
        .where('token', token)
        .update(update)
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