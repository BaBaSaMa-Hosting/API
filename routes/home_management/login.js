const dotenv = require('dotenv');
const mysql = require('mysql');

module.exports = async (fastify, opts) => {
    const buf = Buffer.from('BASIC=basic')
    const config = dotenv.parse(buf, {
        path: './mysql.env'
    });

    var connection = mysql.createConnection({
        host: config.host,
        user: config.username,
        password: config.password,
        database: config.database
    });

    fastify.get('/home_management/login', async function (request, reply) {
        connection.connect();

        connection.query("SELECT * FROM Users", (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            reply.send("success");
        });

        connection.end();
    });
}