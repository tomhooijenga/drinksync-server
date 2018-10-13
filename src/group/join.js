const db = require('../database2');

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

    try {
        await db('group_user')
            .insert(join)
            .returning('*');

    } catch (e) {
        // already joined
    }

    group.users = await db('group_user')
        .select('id', 'name', 'drinks', 'ppm')
        .innerJoin('user', 'user.id', '=', 'group_user.user_id')
        .where('group_id', group.id);

    socket.join(group.name);
    // Send to self and others in this group
    socket.emit('group.update', group);
    socket.to(group.name).emit('group.update', group);
};