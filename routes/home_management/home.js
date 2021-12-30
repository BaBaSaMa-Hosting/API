const dotenv = require('dotenv').config({ path: '/var/www/Main/API/routes/home_management/mysql.env' , debug: true});
const mysql = require('mysql2');
const {v4: uuidv4} = require('uuid');

module.exports = async (fastify, opts) => {
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get list of home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/home/list', async function (request, reply) {
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

        connection.query("SELECT * FROM Users WHERE user_id = '?' AND api_key = '?'", [
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist.'});
                return;
            }
        });

        connection.query("SELECT * FROM User_In_Home UIH INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.user_id = '?'", [
            request.query.user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not have any home registered.'});
                return;
            }
        })

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // create new home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/create', async function (request, reply) {
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

        connection.query("SELECT * FROM Users WHERE user_id = '?' AND api_key = '?'", [
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist.'});
                return;
            }
        });

        let new_home_id = "";
        const generate_home_id = () => {
            new_home_id = uuidv4().substring(0, 12);

            connection.query("SELECT * FROM Homes WHERE home_id = '?'", [
                new_home_id
            ], (error, result, fields) => {
                if (error) return reply.send({output: "error", error: error.message});

                if (result.length > 1) {
                    generate_home_id();
                    return;
                }
            });
        }
        generate_home_id();

        connection.query("INSERT INTO Homes (home_id, home_name, created_on, updated_on, created_by, updated_by) VALUES ('?', '', DEFAULT, DEFAULT, '?', '?')", [
            new_home_id, request.body.user_id, request.body.user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.affectedRows === 0) {
                reply.send({output: 'error', message: 'home creation failed'});
                return;
            }
        });

        connection.query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES ('?', '?', 'Home Owner', 'Staying', DEFAULT)", [
            new_home_id, request.body.user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.affectedRows === 0) {
                reply.send({output: 'error', message: 'adding user to home failed'});
                return;
            }
        });

        reply.send({output: 'success', message: 'home creation success', home_id: new_home_id});
        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // update name
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/update_name', async function (request, reply) {
        if (request.body.api_key === undefined || request.body.api_key === null) {
            reply.send({output: 'error', message: 'api key is not passed in.'});
            return;
        }

        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({output: 'error', message: 'user id is not passed in.'});
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({output: 'error', message: 'home id is not passed in.'});
            return;
        }

        if (request.body.home_name === undefined || request.body.home_name === null) {
            reply.send({output: 'error', message: 'home name is not passed in.'});
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
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist.'});
                return;
            }
        });

        connection.query("SELECT * FROM Homes WHERE home_id = '?'", [
            request.body.home_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'home does not exist'});
                return;
            }

            if (result[0].created_by !== request.body.user_id) {
                reply.send({output: 'error', message: 'you are not the owner of this home'});
                return;
            }
        });

        connection.query("UPDATE Homes SET home_name = '?' WHERE home_id = '?'", [
            request.body.home_name, request.body.home_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.affectedRows === 0) {
                reply.send({output: 'error', message: 'fail to change home name'});
                return;
            }
        });

        reply.send({output: 'success', message: 'home successfully updated'});
        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // add new user into home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/add_new_user', async function (request, reply) {
        if (request.body.api_key === undefined || request.body.api_key === null) {
            reply.send({output: 'error', message: 'api key is not passed in.'});
            return;
        }

        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({output: 'error', message: 'user id is not passed in.'});
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({output: 'error', message: 'home id is not passed in.'});
            return;
        }

        if (request.body.new_user_id === undefined || request.body.new_user_id === null) {
            reply.send({output: 'error', message: 'new user id is not passed in.'});
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
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist.'});
                return;
            }
        });

        connection.query("SELECT * FROM Homes WHERE home_id = '?'", [
            request.body.home_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'home does not exist'});
                return;
            }

            if (result[0].created_by !== request.body.user_id) {
                reply.send({output: 'error', message: 'you are not the owner of this home'});
                return;
            }
        });

        connection.query("SELECT * FROM Users WHERE user_id = '?'", [
            request.body.new_user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'new user does not exist'});
                return;
            }
        });

        connection.query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES ('?', '?', '', DEFAULT, DEFAULT)", [
            request.body.home_id, request.body.new_user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.affectedRows === 0) {
                reply.send({output: 'error', message: 'fail to insert new user into home'});
                return;
            }
        });

        reply.send({output: 'success', message: 'user successfully added into home'});
        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // remove user from home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/remove_user', async function (request, reply) {
        if (request.body.api_key === undefined || request.body.api_key === null) {
            reply.send({output: 'error', message: 'api key is not passed in.'});
            return;
        }

        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({output: 'error', message: 'user id is not passed in.'});
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({output: 'error', message: 'home id is not passed in.'});
            return;
        }

        if (request.body.target_user_id === undefined || request.body.target_user_id === null) {
            reply.send({output: 'error', message: 'target user id is not passed in.'});
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
            request.query.user_id, request.query.api_key
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'user does not exist.'});
                return;
            }
        });

        connection.query("SELECT * FROM Homes WHERE home_id = '?'", [
            request.body.home_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'home does not exist'});
                return;
            }

            if (result[0].created_by !== request.body.user_id) {
                reply.send({output: 'error', message: 'you are not the owner of this home'});
                return;
            }
        });

        connection.query("SELECT * FROM Users WHERE user_id = '?'", [
            request.body.target_user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.length === 0) {
                reply.send({output: 'error', message: 'target user does not exist'});
                return;
            }
        });

        connection.query("UPDATE User_In_Home SET invitation_status = '?' WHERE user_id = '?'", [
            'Exited', request.body.target_user_id
        ], (error, result, fields) => {
            if (error) return reply.send({output: "error", error: error.message});

            if (result.affectedRows === 0) {
                reply.send({output: 'error', message: 'fail to remove user from home'});
                return;
            }
        });

        reply.send({output: 'success', message: 'user successfully added into home'});
        connection.end();
        return;
    });
}