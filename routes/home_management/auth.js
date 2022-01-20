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
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            }); 
        }

        if (request.query.notification_token === undefined || request.query.notification_token === null) {
            return reply.send({
                output: 'error',
                message: 'notification token is not passed in'
            })
        }

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        await connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.query.user_id
        ]).then( async ([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();
                
                return reply.send({
                    output: "retry",
                    message: "Please register an account first",
                    where_to: "register"
                }); 
            }

            if (rows[0].user_notification_token != request.query.notification_token) {
                await connection.promise().query("UPDATE Users SET user_notification_token = ? WHERE user_id = ?", [
                    request.query.notification_token, request.query.user_id
                ]).then( async ([rows, fields]) => {
                    if (rows.affectedRows === 0) {
                        connection.end();
                        
                        return reply.send({
                            output: "error",
                            message: "fail to update user notification token"
                        }); 
                    }
                }).catch((error) => {
                    connection.end();
                    
                    return reply.send({
                        output: "error",
                        message: error.message
                    }); 
                });
            }
            connection.end();
            
            return reply.send({
                output: 'success',
                message: 'user successfully logged in'
            });
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            });
        })
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // register
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/auth/register', async function (request, reply) {
        if (request.body.display_name === undefined || request.body.display_name === null) {
            return reply.send({
                output: 'error',
                message: 'display name is not passed in.'
            }); 
        }

        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            }); 
        }

        if (request.body.auth_type === undefined || request.body.auth_type === null) {
            return reply.send({
                output: 'error',
                message: 'auth type is not passed in.'
            }); 
        }

        if (request.body.notification_token === undefined || request.body.notification_token === null) {
            return reply.send({
                output: 'error',
                message: 'notification is not passed in.'
            }); 
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
                connection.end();
                
                return reply.send({
                    output: "retry",
                    message: "Account already exist",
                    where_to: "login"
                }); 
            }
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            }); 
        });

        connection.promise().query("INSERT INTO Users (user_id, display_name, auth_type, user_notification_token) VALUES (?, ?, ?, ?)", [
            request.body.user_id, request.body.display_name, request.body.auth_type, request.body.notification_token
        ]).then(([rows, fields]) => {
            connection.end();
            
            if (rows.affectedRows === 0) {
                return reply.send({
                    output: 'error',
                    message: 'user register error'
                }); 
            }

            return reply.send({
                output: 'success',
                message: 'user successfully register'
            });
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            });
        })
    });
}