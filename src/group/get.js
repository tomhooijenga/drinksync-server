const db = require('../database2');

module.exports = async function get(socket, token, name, send) {
    const group = await db('group')
        .select()
        .where('name', name)
        .first();

    group.users = await db('user')
        .select('id', 'name', 'drinks', 'ppm')
        .innerJoin('group_user', 'group_user.user_id', '=', 'user.id')
        .where('group_user.group_id', group.id);

    send(group);
};