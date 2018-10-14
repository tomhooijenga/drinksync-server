const db = require('../database');

module.exports = async function (socket, token, name) {
    const user = await db('user')
        .select()
        .where('token', token)
        .first();

    const group = await db('group')
        .select()
        .where('name', name)
        .first();

    if (user === undefined) {
        return;
    } else if (group === undefined) {
        return;
    }

    const join = {
        user_id: user.id,
        group_id: group.id
    };

    await db('group_user')
        .where(join)
        .delete();

    group.users = await db('group_user')
        .select('id', 'name', 'drinks', 'ppm')
        .innerJoin('user', 'user.id', '=', 'group_user.user_id')
        .where('group_id', group.id);

    socket.emit('group.update', group);
    socket.to(group.name).emit('group.update', group);
    socket.leave(group.name);
};