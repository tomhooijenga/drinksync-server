const db = require('../database2');
const io = require('../socket');
const {PPM_PER_HOUR} = require("../constants");

console.log('Executing [/bin/update-ppm]');

module.exports = async function () {
    const {rows} = await db.raw(`
      SELECT
        EXTRACT(epoch FROM now() - last_updated) AS elapsed
      FROM cron
      WHERE id = 1
    `);

    const elapsed = rows[0].elapsed;
    const hours = elapsed / 3600;
    const ppm = Math.round(PPM_PER_HOUR * hours);

    const users = await db('user')
        .update('ppm', db.raw('GREATEST(0, ppm - ?)', [ppm]));

    console.log(`${hours} hours elapsed, burning ${ppm} ppm`);
    console.log(`${users} users updated`);

    const cron = await db('cron')
        .update('last_updated', 'now()')
        .where('id', 1)
        .returning('*');

    if (cron.length === 0) {
        console.error('Cron time not updated');
    } else {
        console.log(`Set cron to ${cron[0].last_updated}`);
    }

    const groups = await db('group').select();
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
};