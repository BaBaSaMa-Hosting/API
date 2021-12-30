const dotenv = require('dotenv').config({
    path: '/var/www/Main/API/routes/home_management/mysql.env',
    debug: true
});
const mysql = require('mysql2');
const {
    v4: uuidv4
} = require('uuid');

module.exports = async (fastify, opts) => {
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // login
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/auth/login', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        connection.query("SELECT * FROM Users WHERE user_id = '?'", [
            request.query.user_id
        ], (error, result, fields) => {
            if (error) return reply.send({
                output: "error",
                error: error.message
            });

            if (result.length === 0) {
                if (request.query.api_key === undefined || request.query.api_key === null) {
                    let new_api_key = uuidv4();
                    reply.send({
                        output: 'failure',
                        message: 'No API Key received, here is a new one',
                        api_key: new_api_key
                    });
                    return;
                }

                reply.send({
                    output: "error",
                    error: "Please register an account first"
                });
                return;
            }
        });

        if (request.query.api_key === undefined || request.query.api_key === null) {
            reply.send({
                output: 'failure',
                message: 'Need to reset api key'
            });
            return;
        }

        connection.query("SELECT * FROM Users WHERE user_id = '?' AND api_key = '?'", [
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({
                output: "error",
                error: error.message
            });

            if (result.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user successfully logged in'
            });
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // register
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/auth/register', async function (request, reply) {
        if (request.body.api_key === undefined || request.body.api_key === null) {
            reply.send({
                output: 'error',
                message: 'api key is not passed in.'
            });
            return;
        }

        if (request.body.display_name === undefined || request.body.display_name === null) {
            reply.send({
                output: 'error',
                message: 'display name is not passed in.'
            });
            return;
        }

        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        connection.query("SELECT * FROM Users WHERE user_id = '?' AND api_key = '?'", [
            request.body.user_id, request.body.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({
                output: "error",
                error: error.message
            });

            if (result.length > 0) {
                reply.send({
                    output: 'error',
                    message: 'user already exist'
                });
                return;
            }
        });

        connection.query("INSERT INTO Users (user_id, display_name, api_key) VALUES ('?', '?', '?')", [
            request.body.user_id,  request.body.display_name, request.body.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({
                output: "error",
                error: error.message
            });

            if (result.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'user register failure'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user successfully register'
            });
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // reset api key
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/auth/reset_api_key', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        let new_api_key = uuidv4();
        connection.connect();

        connection.query("SELECT * FROM Users WHERE user_id = '?'", [
            request.query.user_id
        ], (error, result, fields) => {
            if (error) return reply.send({
                output: "error",
                error: error.message
            });

            if (result.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        });

        connection.query("UPDATE Users SET api_key = '?' WHERE user_id = '?'", [
            new_api_key, request.query.user_id
        ], (error, result, fields) => {
            if (error) return reply.send({
                output: "error",
                error: error.message
            });

            if (result.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'api key removal failed'
                });
                return;
            }
        });

        reply.send({
            output: 'success',
            message: 'api key successfully reseted',
            api_key: new_api_key
        });
        connection.end();
        return;
    });
}