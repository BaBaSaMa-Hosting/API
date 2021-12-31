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
    // get display name
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/user', async function (request, reply) {
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
                output: "success",
                display_name: rows[0].display_name
            })
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
    // update display name
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/user/update_name', async function (request, reply) {
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
        });

        connection.promise().query("UPDATE Users SET display_name = ? WHERE user_id = ?", [
            request.body.new_display_name, request.body.user_id
        ]).then(([rows, fields]) => {
            if (result.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'user register failure'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user display name successfully updated'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                error: error.message
            });
            connection.end();
            return;
        });

        connection.end();
        return;
    });
}