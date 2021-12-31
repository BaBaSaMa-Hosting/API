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

            reply.send({
                output: 'success',
                message: 'user successfully logged in'
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
    // register
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/auth/register', async function (request, reply) {
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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 1) {
                reply.send({
                    output: "retry",
                    error: "Account already exist",
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

        connection.promise().query("INSERT INTO Users (user_id, display_name) VALUES (?, ?)", [
            request.body.user_id, request.body.display_name
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
}