const db = require('../database2');
const uuid = require('uuid/v4');

const defaultUser = Object.freeze({
    drinks: 0,
    ppm: 0,
    name: `Username`
});

module.exports = async function (socket, token) {
    let user = await db
        .select('*')
        .from('user')
        .where('token', token)
        .first();

    if (user === undefined) {
        [user] = await db
            .insert({
                ...defaultUser,
                token: uuid()
            })
            .into('user')
            .returning('*')
    }

    const groups = await db('group')
        .select('id', 'name')
        .innerJoin('group_user', function () {
            this.on('group_user.group_id', '=', 'group.id')
                .andOn('group_user.user_id', '=', user.id)
        });

    await Promise.all(
        groups.map(group => {
            socket.join(group.name);

            return db('group_user')
                .select('id', 'name', 'drinks', 'ppm')
                .innerJoin('user', 'user.id', '=', 'group_user.user_id')
                .where('group_id', group.id)
                .then(users => group.users = users);
        })
    );

    socket.emit('user.join', {
        user,
        groups
    });
};