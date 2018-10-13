const db = require('../database2');
const io = require('../socket');
const {PPM_PER_HOUR} = require("../constants");

db('cron').first().then(({last_updated}) => {
    const elapsed = new Date().getTime() - last_updated.getTime();
    const hours = elapsed / 3600000;
    const ppm = Math.round(PPM_PER_HOUR * hours);

    return db('user').update('ppm', db.raw('GREATEST(0, ppm - ?)', [ppm]));
}).then(() => {
    db('cron')
        .update('last_updated', new Date())
        .where('id', 1)
        .then();

    return db('group').select().then();
}).then(groups => {
    groups.forEach(group => {
        db('group_user')
            .select('id', 'name', 'drinks', 'ppm',)
            .innerJoin('user', 'group_user.user_id', '=', 'user.id')
            .where('group_user.group_id', group.id)
            .then(users => {
                group.users = users;

                io.to(group.name).emit('group.update', group);
            })
    })
});