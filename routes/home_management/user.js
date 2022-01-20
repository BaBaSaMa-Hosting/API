const dotenv = require('dotenv').config({
    path: '/var/www/Main/API/routes/home_management/mysql.env',
    debug: true
});
const mysql = require('mysql2');
const {
    v4: uuidv4
} = require('uuid');

const { check_user_exist } = require('./common_query');
const { get_user_details } = require('./notification_information');

module.exports = async (fastify, opts) => {
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get user details name
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/user', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        if (await check_user_exist(reply, connection, request.query.user_id)) {
            const user = await get_user_details(reply, connection, request.query.user_id);
            if (user.length === 0) return;

            user[0].user_notification_token = "You Fool! THUNDER CROSS SPLIT ATTACK!"

            connection.end();
            return reply.send({
                output: "success",
                display_name: user[0]
            })
        }

        return reply;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // update display name
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/user/update_name', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.new_display_name === undefined || request.body.new_display_name === null) {
            return reply.send({
                output: 'error',
                message: 'display name is not passed in.'
            });
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();
        
        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        await connection.promise().query("UPDATE Users SET display_name = ? WHERE user_id = ?", [
            request.body.new_display_name, request.body.user_id
        ]).then(([rows, fields]) => {
            connection.end();
            if (rows.affectedRows === 0) {
                return reply.send({
                    output: 'error',
                    message: 'user register failure'
                });
            }

            return reply.send({
                output: 'success',
                message: 'user display name successfully updated'
            });
        }).catch((error) => {
            connection.end();
            return reply.send({
                output: "error",
                message: error.message
            });
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get user lists
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/users', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        if (!await check_user_exist(reply, connection, request.query.user_id)) return reply;

        await connection.promise().query("SELECT * FROM Users WHERE user_id != ?", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            connection.end();
            if (rows.length === 0) {
                return reply.send({
                    output: "error",
                    message: "no user retrieved"
                });
            }

            rows.forEach((i, index) => {
                rows[index].auth_type = "as if im letting you know"
                rows[index].user_notification_token = "You Fool! THUNDER CROSS SPLIT ATTACK!"
            });

            return reply.send({
                output: 'success',
                users: rows
            });
        }).catch((error) => {
            connection.end();
            return reply.send({
                output: "error",
                message: error.message
            });
        });
    });
}