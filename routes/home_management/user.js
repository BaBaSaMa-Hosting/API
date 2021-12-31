const dotenv = require('dotenv').config({ path: '/var/www/Main/API/routes/home_management/mysql.env' , debug: true});
const mysql = require('mysql2');
const {v4: uuidv4} = require('uuid');

module.exports = async (fastify, opts) => {
    fastify.get('/home_management/user', async function (request, reply) {
        if (request.query.api_key === undefined || request.query.api_key === null) {
            let new_api_key = uuidv4();
            reply.send({output: 'failure', message: 'No API Key received, here is a new one', api_key: new_api_key});
            return;
        }

        if (request.query.user_id === undefined || request.query.user_id === null) {
            reply.send({output: 'error', message: 'user id is not passed in.'});
            return;
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });
        
        connection.connect();

        connection.query("SELECT * FROM Users WHERE user_id = ? AND api_key = ?", [
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist.'});
                return;
            }

            reply.send({output: 'success', username: result[0].display_name});
        });

        connection.end();
        return;
    });

    fastify.post('/home_management/user/update_name', async function (request, reply) {
        if (request.body.api_key === undefined || request.body.api_key === null) {
            reply.send({output: 'error', message: 'api key is not passed in.'});
            return;
        }

        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({output: 'error', message: 'user id is not passed in.'});
            return;
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });
        
        connection.connect();

        connection.query("SELECT * FROM Users WHERE user_id = ? AND api_key = ?", [
            request.body.user_id, request.body.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist'});
                return;
            }
        });

        connection.query("UPDATE Users SET display_name = ? WHERE user_id = ? AND api_key = ?", [
            request.body.new_display_name, request.body.user_id, request.body.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.affectedRows === 0) {
                reply.send({output: 'error', message: 'user register failure'});
                return;
            }

            reply.send({output: 'success', message: 'user display name successfully updated'});
        });

        connection.end();
        return;
    });
}