const dotenv = require('dotenv').config({
    path: '/var/www/Main/API/routes/home_management/mysql.env',
    debug: true
});
const mysql = require('mysql2');
const {
    v4: uuidv4
} = require('uuid');

const { check_user_exist, check_home_exist, check_user_in_home, adding_category_into_home } = require('./common_query');
const { get_user_details, get_home_details, get_home_users_details } = require('./notification_information');
const { admin } = require('./firebase_config');

module.exports = async (fastify, opts) => {
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get list of home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/home/list', async function (request, reply) {
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

        if (!await check_user_exist(reply, connection, request.query.user_id)) return;

        await connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.user_id = ? ", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not have any home registered.'
                });

                connection.end();
                return;
            }

            new Promise((resolve, reject) => {
                rows.forEach((i, index) => {
                    let buffer  = new Buffer(i.home_image, 'base64');
                    rows[index].home_image = buffer.toString();

                    if (index === rows.length) resolve();
                })
            }).then(() => {
                reply.send({
                    output: 'success',
                    home: rows
                });

                connection.end();
                return;
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get home detail
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/home/detail', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.query.home_id === undefined || request.query.home_id === null) {
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

        if (!await check_user_exist(reply, connection, request.query.user_id)) return;

        if (!await check_home_exist(reply, connection, request.query.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.query.home_id, request.query.user_id)) return;

        await connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.query.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist.'
                });

                connection.end();
                return;
            }

            let buffer = new Buffer(rows[0].home_image, 'base64');
            rows[0].home_image = buffer.toString();
            
            reply.send({
                output: "success",
                home: rows[0]
            });

            connection.end();
            return;
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get users staying in home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/home/users', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.query.home_id === undefined || request.query.home_id === null) {
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

        if (!await check_user_exist(reply, connection, request.query.user_id)) return;

        if (!await check_home_exist(reply, connection, request.query.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.query.home_id, request.query.user_id)) return;

        await connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Users U ON U.user_id = UIH.user_id WHERE UIH.user_id != ? AND UIH.home_id = ?", [
            request.query.user_id, request.query.home_id 
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'there is no other user in home.'
                });

                connection.end();
                return;
            }

            reply.send({
                output: 'success',
                users: rows
            });

            connection.end();
            return;
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // create new home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/create', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_name === undefined || request.body.home_name === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_image === undefined || request.body.home_image === null) {
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

        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        let new_home_id = "";

        await new Promise ((resolve, reject) => {
            while (true) {
                new_home_id = uuidv4().substring(0, 12);

                connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
                    new_home_id
                ]).then(([rows, fields]) => {
                    if (rows.length === 0) resolve();
                }).catch((error) => {
                    reject(error);
                });
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        await connection.promise().query("INSERT INTO Homes (home_id, home_name, home_image, created_on, updated_on, created_by, updated_by) VALUES (?, ?, ?, DEFAULT, DEFAULT, ?, ?)", [
            new_home_id, request.body.home_name, request.body.home_image, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'home creation failed'
                });

                connection.end();
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        await connection.promise().query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES (?, ?, 'Home Owner', 'Staying', DEFAULT)", [
            new_home_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'adding user to home failed'
                });

                connection.end();
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        const default_categories = ["242c1439-fe45-42ff-af17-92d3c240ec96", "2d776bca-6c07-4b61-9d4c-e916b76ce42a", "68792937-db58-485a-bfc6-1856b243407e", "9aa2e39b-eb4d-4689-9aa3-46d20c49250e", "c60bc19e-be0a-40ef-950c-fe8136018bf7"];
        
        if (!await adding_category_into_home(reply, connection, new_home_id, request.body.user_id, "242c1439-fe45-42ff-af17-92d3c240ec96"))
        new Promise((resolve, reject) => {
            default_categories.forEach((category_id, index) => {
                if (!await adding_category_into_home(reply, connection, new_home_id, request.body.user_id, "242c1439-fe45-42ff-af17-92d3c240ec96")) reject();

                if (index === default_categories.length) resolve();
            });
        }).catch(() => {
            return;
        });
            
        reply.send({
            output: 'success',
            message: 'home creation success',
            home_id: new_home_id
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // update
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/update', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({
                output: 'error',
                message: 'home id is not passed in.'
            });
            return;
        }

        if (request.body.home_name === undefined || request.body.home_name === null) {
            reply.send({
                output: 'error',
                message: 'home name is not passed in.'
            });
            return;
        }

        if (request.body.home_image === undefined || request.body.home_image === null) {
            reply.send({
                output: 'error',
                message: 'home name is not passed in.'
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
        
        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        await connection.promise().query("UPDATE Homes SET home_name = ?, home_image = ?, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ?", [
            request.body.home_name, request.body.home_image, request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to change home name'
                });

                connection.end();
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return;

        const message = {
            notification: { 
                title: `${home[0].home_name} Has Been Updated`, 
                body: `Home ${home[0].home_name} Has Been Updated By ${user[0].display_name}.`
            }
        }

        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        }
        
        for (let _user in users) {
            if (_user.user_notification_token === "" || _user.user_notification_token === null || _user.user_notification_token === undefined)
                continue;

            admin.messaging().sendToDevice(_user.user_notification_token, message, options)
            .then((response) => {
                console.log("message sent successfully")
            }).catch((error) => {
                console.error(error);
            });
        }

        reply.send({
            output: 'success',
            message: 'home successfully updated'
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // add new user into home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/add_new_user', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({
                output: 'error',
                message: 'home id is not passed in.'
            });
            return;
        }

        if (request.body.new_user_id === undefined || request.body.new_user_id === null) {
            reply.send({
                output: 'error',
                message: 'new user id is not passed in.'
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
        
        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        if (!await check_user_exist(reply, connection, request.body.new_user_id)) return;

        await connection.promise().query("SELECT * FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
            request.body.new_user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length > 0) {
                reply.send({
                    output: 'error',
                    message: 'new user already in home'
                });

                connection.end();
                return;
            }
        }).catch((error) => { 
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        await connection.promise().query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES (?, ?, '', DEFAULT, DEFAULT)", [
            request.body.home_id, request.body.new_user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to insert new user into home'
                });

                connection.end();
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        connection.promise().query("UPDATE Homes SET updated_on = CURRENT_TIMESTAMP, updated_by = ? WHERE home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to update home'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return;

        const new_user = await get_user_details(reply, connection, request.body.new_user_id);
        if (new_user.length === 0) return;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return;

        if (new_user[0].user_notification_token !== null && new_user[0].user_notification_token !== undefined && new_user[0].user_notification_token !== "") {
            const message = {
                notification: { 
                    title: `${user[0].display_name} Has Invited You Into Their Home`, 
                    body: `${new_user[0].display_name}, Welcome to ${home[0].home_name}`
                }
            }
    
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            }
    
            admin.messaging().sendToDevice(new_user[0].user_notification_token, message, options)
            .then((response) => {
                console.log("message sent successfully")
            }).catch((error) => {
                console.error(error);
            });
        }

        reply.send({
            output: 'success',
            message: 'user successfully added into home'
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // set user to staying
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/update_invitation', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({
                output: 'error',
                message: 'home id is not passed in.'
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

        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        await connection.promise().query("UPDATE User_In_Home SET invitation_status = 'Staying', last_updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND user_id = ?", [
            request.body.home_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to change home name'
                });

                connection.end();
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        var owner;
        await connection.promise().query("SELECT * FROM Homes H INNER JOIN Users U WHERE H.created_by = U.user_id WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });

                connection.end();
                return;
            }

            owner = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        if (owner.user_notification_token !== null && owner.user_notification_token !== undefined && owner.user_notification_token !== "") {
            const user = await get_user_details(reply, connection, request.body.user_id);
            if (user.length === 0) return;
    
            const home = await get_home_details(reply, connection, request.body.home_id);
            if (home.length === 0) return;
    
            const message = {
                notification: { 
                    title: `${user[0].display_name} Has Joined Your Home`, 
                    body: `${home[0].home_name} Has a New Member, ${user[0].display_name}`
                }
            }
    
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            }

            admin.messaging().sendToDevice(owner.user_notification_token, message, options)
            .then((response) => {
                console.log("message sent successfully")
            }).catch((error) => {
                console.error(error);
            });
        }

        reply.send({
            output: 'success',
            message: 'status successfully updated'
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // update staying users
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/update_users', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({
                output: 'error',
                message: 'home id is not passed in.'
            });
            return;
        }

        if (request.body.user_ids === undefined || request.body.user_ids === null) {
            reply.send({
                output: 'error',
                message: 'user list is not passed in.'
            });
            return;
        }

        let user_ids = JSON.parse(request.body.user_ids);

        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();
        
        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        let target_user_list = []

        await connection.promise().query("SELECT * FROM User_In_Home WHERE home_id = ? AND user_id != ?", [
            request.body.home_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                target_user_list = user_ids
            }

            rows.forEach((i, index) => {
                if (!user_ids.includes(i.user_id)) target_user_list.push(i.user_id);
            })
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        new Promise ((resolve, reject) => {
            const owner = await get_user_details(reply, connection, request.body.user_id);
            if (owner.length === 0) return;
    
            const home = await get_home_details(reply, connection, request.body.home_id);
            if (home.length === 0) return;

            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            }

            target_user_list.forEach(async (i, index) => {
                let insert = false;
                let user;
                await connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Users U ON UIH.user_id = U.user_id INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.home_id = ? AND UIH.user_id = ?", [
                    request.body.home_id, i
                ]).then(([rows, fields]) => {
                    user = rows;
                    if (rows.length === 0) {
                        insert = true
                    } 
                }).catch((error) => {
                    reject(error);
                });

                let message;

                if (insert) {
                    await connection.promise().query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES (?, ?, '', DEFAULT, DEFAULT)", [
                        request.body.home_id, i
                    ]).then(([rows, fields]) => {
                        if (rows.affectedRows === 0) {
                            reply.send({
                                output: 'error',
                                message: 'fail to add user to home'
                            });
                            return;
                        }
        
                        message = {
                            notification: { 
                                title: `${owner.display_name} Has Invited You Into Their Home`, 
                                body: `${user[0].display_name}, Welcome to ${user[0].home_name}`
                            }
                        }
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    await connection.promise().query("DELETE FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
                        i, request.body.home_id
                    ]).then(([rows, fields]) => {
                        if (rows.affectedRows === 0) {
                            reply.send({
                                output: 'error',
                                message: 'fail to delete user from home'
                            });
                            return;
                        }
    
                        message = {
                            notification: { 
                                title: `You Has Remove From Home ${rows[0].home_name}`, 
                                body: `Good Bye`
                            }
                        }
                    }).catch((error) => {
                        reject(error);
                    });
                }

                if (user[0].user_notification_token !== null && user[0].user_notification_token !== undefined && user[0].user_notification_token !== "") {
                    admin.messaging().sendToDevice(user[0].user_notification_token, message, options)
                    .then((response) => {
                        console.log("message sent successfully")
                    }).catch((error) => {
                        console.error(error);
                    });
                }

                if (index == user_ids.length) resolve()
            });
        }).then(() => {
            reply.send({
                output: 'success',
                message: 'successfully edited the users in home.'
            });

            connection.end();
            return;
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        })
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // remove user from home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/leave', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.home_id === null) {
            reply.send({
                output: 'error',
                message: 'home id is not passed in.'
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
        
        if (!await check_user_exist(reply, connection, request.body.user_id)) return;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        await connection.promise().query("DELETE FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
            request.body.target_user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to remove user from home'
                });

                connection.end();
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });

            connection.end();
            return;
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return;

        const message_to_user = {
            notification: { 
                title: `You Have Left Home ${home.home_name}`, 
                body: `Good Bye`
            }
        }

        const message_to_users = {
            notification: { 
                title: `${user[0].display_name} Have Left Home ${home.home_name}`, 
                body: `Bye Bye `
            }
        }

        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        }

        for (let _user in users) {
            if (_user.user_notification_token === "" || _user.user_notification_token === null || _user.user_notification_token === undefined)
                continue;

            admin.messaging().sendToDevice(_user.user_notification_token, message_to_users, options)
            .then((response) => {
                console.log("message sent successfully")
            }).catch((error) => {
                console.error(error);
            });
        }

        if (user[0].user_notification_token !== "" && user[0].user_notification_token !== null && user[0].user_notification_token !== undefined) {
            admin.messaging().sendToDevice(user[0].user_notification_token, message_to_user, options)
            .then((response) => {
                console.log("message sent successfully")
            }).catch((error) => {
                console.error(error);
            });
        }

        reply.send({
            output: 'success',
            message: 'user successfully removed from home'
        });

        connection.end();
        return;
    });
}