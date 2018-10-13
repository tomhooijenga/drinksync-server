const generate = require("adjective-adjective-animal");
const db = require('../database2');

module.exports = async function(socket, token, send) {
    const user = await db('user')
        .select()
        .where('token', token)
        .first();

    if (user === undefined) {
        return;
    }

    let name = await generate(1);
    while (await db('group').where('name', name).first()) {
        name = await generate(1);
    }

    const [group] = await db('group')
        .insert({
            name
        })
        .returning('*');
    group.users = [user];

    await db('group_user')
        .insert({
            group_id: group.id,
            user_id: user.id
        });

    send(group);
};