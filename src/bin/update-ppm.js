const db = require('../database2');
const io = require('../socket');
const {PPM_PER_HOUR} = require("../constants");

db.raw(`
  SELECT
    EXTRACT(epoch FROM now() - last_updated) AS elapsed
  FROM cron
  WHERE id = 1
`).then(({rows}) => {
    const elapsed = rows[0].elapsed;
    const hours = elapsed / 3600;
    const ppm = Math.round(PPM_PER_HOUR * hours);

    console.log(`${hours} hours elapsed, burning ${ppm} ppm`);

    return db('user')
        .update('ppm', db.raw('GREATEST(0, ppm - ?)', [ppm]))
        .then(updated => {
            console.log(`${updated} users updated`)
        });
}).then(() => {
    db('cron')
        .update('last_updated', 'now()')
        .where('id', 1)
        .returning('*')
        .then(updated => {
            if (updated.length === 0) {
                console.error('Cron time not updated');
            } else {
                console.log(`Set cron to ${updated[0].last_updated}`);
            }
        });

    return db('group').select();
}).then(groups => {
    console.log(`Notifying ${groups.length} groups`);

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