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

        if (request.query.api_key === undefined || request.query.api_key === null) {
            let new_api_key = uuidv4();
            reply.send({
                output: 'retry',
                message: 'No API Key received, here is a new one',
                api_key: new_api_key,
                where_to: "login"
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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: "retry",
                    error: "Please register an account first",
                    where_to: "register"
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end();
            return;
        })

        connection.promise().query("SELECT * FROM Users WHERE user_id = ? AND api_key = ?", [
            request.query.user_id, request.query.api_key
        ]).then(([rows, fields]) => {
            if (result.length === 0) {
                reply.send({
                    output: 'retry',
                    message: 'api key does not match.',
                    where_to: "reset"
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user successfully logged in'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end()
            return;
        })

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

        connection.promise().query("SELECT * FROM Users WHERE user_id = '?' AND api_key = '?'", [
            request.body.user_id, request.body.api_key
        ]).then(([rows, fields]) => {
            if (result.length > 0) {
                reply.send({
                    output: 'retry',
                    message: 'user already exist',
                    where_to: "login"
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end();
            return;
        });

        connection.promise().query("INSERT INTO Users (user_id, display_name, api_key) VALUES ('?', '?', '?')", [
            request.body.user_id, request.body.display_name, request.body.api_key
        ]).then(([rows, fields]) => {
            if (result.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'user register error'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user successfully register'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end();
            return;
        })

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

        connection.promise().query("SELECT * FROM Users WHERE user_id = '?'", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (result.length === 0) {
                reply.send({
                    output: 'retry',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end();
            return;
        });

        connection.promise().query("UPDATE Users SET api_key = '?' WHERE user_id = '?'", [
            new_api_key, request.query.user_id
        ]).then(([rows, fields]) => {
            if (result.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'api key removal failed'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end();
            return;
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