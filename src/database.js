const knex = require('knex');
const client = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL + '?ssl=true&sslmode=require',
});

module.exports = client;