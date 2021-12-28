const dotenv = require('dotenv').config({ path: '/var/www/Main/API/routes/home_management/mysql.env' , debug: true});
const mysql = require('mysql2');

module.exports = async (fastify, opts) => {
    console.log(`env config: ${JSON.stringify(process.env)}`);

    fastify.get('/home_management/login', async function (request, reply) {
        reply.send({request_params: request.params, request_query: request.query, request_body: request.body});
        return;

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });
        
        connection.connect();

        connection.query("SELECT * FROM Users", (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            
        });

        connection.end();
    });
}