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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.user_id = ? ", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not have any home registered.'
                });
                return;
            }

            rows.forEach((i, index) => {
                let buffer  = new Buffer(i.home_image, 'base64');
                rows[index].home_image = buffer.toString();
            })

            reply.send({
                output: 'success',
                home: rows
            })
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.end();
        return;
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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.query.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.user_id = ?", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not have any home registered.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        await connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.query.home_id
        ]).then( async ([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist.'
                });
                return;
            }

            let buffer  = new Buffer(rows[0].home_image, 'base64');
            rows[0].home_image = buffer.toString();
            
            reply.send({
                output: "success",
                home: rows[0]
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get user staying in home
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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.query.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Users U ON U.user_id = UIH.user_id WHERE UIH.user_id != ? AND UIH.home_id = ?", [
            request.query.user_id, request.query.home_id 
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'there is no other user in home.'
                });
                return;
            }

            reply.send({
                output: 'success',
                users: rows
            })
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.end();
        return;
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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        let new_home_id = "";
        const generate_home_id = () => {
            new_home_id = uuidv4().substring(0, 12);

            connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
                new_home_id
            ]).then(([rows, fields]) => {
                if (rows.length > 1) {
                    generate_home_id();
                    return;
                }
            }).catch((error) => {
                reply.send({
                    output: "error",
                    message: error.message
                });
            });
        }
        generate_home_id();

        connection.promise().query("INSERT INTO Homes (home_id, home_name, home_image, created_on, updated_on, created_by, updated_by) VALUES (?, ?, ?, DEFAULT, DEFAULT, ?, ?)", [
            new_home_id, request.body.home_name, request.body.home_image, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'home creation failed'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO Home_Have_Item_Category (home_id, category_id, active, created_by, created_on, updated_by, updated_on) VALUES (?, '242c1439-fe45-42ff-af17-92d3c240ec96', DEFAULT, ?, DEFAULT, ?, DEFAULT);", [
            new_home_id, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to add default category'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO Home_Have_Item_Category (home_id, category_id, active, created_by, created_on, updated_by, updated_on) VALUES (?, '2d776bca-6c07-4b61-9d4c-e916b76ce42a', DEFAULT, ?, DEFAULT, ?, DEFAULT);", [
            new_home_id, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to add default category'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO Home_Have_Item_Category (home_id, category_id, active, created_by, created_on, updated_by, updated_on) VALUES (?, '68792937-db58-485a-bfc6-1856b243407e', DEFAULT, ?, DEFAULT, ?, DEFAULT);", [
            new_home_id, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to add default category'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO Home_Have_Item_Category (home_id, category_id, active, created_by, created_on, updated_by, updated_on) VALUES (?, '9aa2e39b-eb4d-4689-9aa3-46d20c49250e', DEFAULT, ?, DEFAULT, ?, DEFAULT);", [
            new_home_id, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to add default category'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO Home_Have_Item_Category (home_id, category_id, active, created_by, created_on, updated_by, updated_on) VALUES (?, 'c60bc19e-be0a-40ef-950c-fe8136018bf7', DEFAULT, ?, DEFAULT, ?, DEFAULT);", [
            new_home_id, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to add default category'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES (?, ?, 'Home Owner', 'Staying', DEFAULT)", [
            new_home_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'adding user to home failed'
                });
                return;
            }
            
            reply.send({
                output: 'success',
                message: 'home creation success',
                home_id: new_home_id
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
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

        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });
                return;
            }

            if (rows[0].created_by !== request.body.user_id) {
                reply.send({
                    output: 'error',
                    message: 'you are not the owner of this home'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Homes SET home_name = ?, home_image = ? WHERE home_id = ?", [
            request.body.home_name, request.body.home_image, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to change home name'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'home successfully updated'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
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

        var user;
        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }

            user = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        var home;
        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });
                return;
            }

            if (rows[0].created_by !== request.body.user_id) {
                reply.send({
                    output: 'error',
                    message: 'you are not the owner of this home'
                });
                return;
            }
            home = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        var new_user;
        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.new_user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'new user does not exist'
                });
                return;
            }
            new_user = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
            request.body.new_user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'new user already in home'
                });
                return;
            }
        }).catch((error) => { 
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES (?, ?, '', DEFAULT, DEFAULT)", [
            request.body.home_id, request.body.new_user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to insert new user into home'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Homes SET updated_on = current_timestamp, updated_by = ? WHERE home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to update home'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user successfully added into home'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        if (new_user.user_notification_token == null || new_user.user_notification_token == undefined || new_user.user_notification_token == "") {
            connection.end();
            return;
        }

        const message = {
            notification: { 
                title: `${user.display_name} Has Invited You Into Their Home`, 
                body: `${new_user.display_name}, Welcome to ${home.home_name}`
            }
        }

        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        }

        admin.messaging().sendToDevice(new_user.user_notification_token, message, options)
        .then((response) => {
            console.log("message sent successfully")
        }).catch((error) => {
            console.error(error);
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

        var user;
        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
            user = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        var home;
        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        var owner;
        connection.promise().query("SELECT * FROM Homes H INNER JOIN Users U WHERE H.created_by = U.user_id WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });
                return;
            }

            owner = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE User_In_Home SET invitation_status = 'Staying', last_updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND user_id = ?", [
            request.body.home_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to change home name'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'status successfully updated'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        const message = {
            notification: { 
                title: `${user.display_name} Has Joined Your Home`, 
                body: `${home.home_name} Has a New Member, ${user.display_name}`
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

        var user;
        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
            user = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });
                return;
            }

            if (rows[0].created_by !== request.body.user_id) {
                reply.send({
                    output: 'error',
                    message: 'you are not the owner of this home'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

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
        });

        new Promise ((resolve, reject) => {
            target_user_list.forEach((i, index) => {
                connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Users U ON UIH.user_id = U.user_id INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.home_id = ? AND UIH.user_id = ?", [
                    request.body.home_id, i
                ]).then(([rows, fields]) => {
                    if (rows.length === 0) {
                        connection.promise().query("INSERT INTO User_In_Home (home_id, user_id, user_relationship, invitation_status, last_updated_on) VALUES (?, ?, '', DEFAULT, DEFAULT)", [
                            request.body.home_id, i
                        ]).then(([rows2, fields]) => {
                            if (rows2.affectedRows === 0) {
                                reply.send({
                                    output: 'error',
                                    message: 'fail to add user to home'
                                });
                                return;
                            }
                
                            reply.send({
                                output: 'success',
                                message: 'user successfully added into home'
                            });

                            const message = {
                                notification: { 
                                    title: `${user.display_name} Has Invited You Into Their Home`, 
                                    body: `${rows[0].display_name}, Welcome to ${rows[0].home_name}`
                                }
                            }
                    
                            const options = {
                                priority: "high",
                                timeToLive: 60 * 60 * 24
                            }
                    
                            admin.messaging().sendToDevice(rows[0].user_notification_token, message, options)
                            .then((response) => {
                                console.log("message sent successfully")
                            }).catch((error) => {
                                console.error(error);
                            });

                            if (index == user_ids.length) resolve()
                        }).catch((error) => {
                            reply.send({
                                output: "error",
                                message: error.message
                            });
                        });
                    } else {
                        connection.promise().query("DELETE FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
                            i, request.body.home_id
                        ]).then(([rows, fields]) => {
                            if (rows.affectedRows === 0) {
                                reply.send({
                                    output: 'error',
                                    message: 'fail to delete user from home'
                                });
                                return;
                            }
                
                            reply.send({
                                output: 'success',
                                message: 'user successfully remove from home'
                            });

                            const message = {
                                notification: { 
                                    title: `You Has Remove From Home ${rows[0].home_name}`, 
                                    body: `Good Bye`
                                }
                            }
                    
                            const options = {
                                priority: "high",
                                timeToLive: 60 * 60 * 24
                            }
                    
                            admin.messaging().sendToDevice(rows[0].user_notification_token, message, options)
                            .then((response) => {
                                console.log("message sent successfully")
                            }).catch((error) => {
                                console.error(error);
                            });

                            if (index == user_ids.length) resolve()
                        }).catch((error) => {
                            reply.send({
                                output: "error",
                                message: error.message
                            });
                        });
                    }
                }).catch((error) => {
                    reply.send({
                        output: "error",
                        message: error.message
                    });
                });
            })
        }).then(() => {
            connection.end();
            return;
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // remove user from home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/remove_user', async function (request, reply) {
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

        if (request.body.target_user_id === undefined || request.body.target_user_id === null) {
            reply.send({
                output: 'error',
                message: 'target user id is not passed in.'
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
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        var home;
        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not exist'
                });
                return;
            }

            if (rows[0].created_by !== request.body.user_id) {
                reply.send({
                    output: 'error',
                    message: 'you are not the owner of this home'
                });
                return;
            }
            home = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        var user;
        connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
            request.body.target_user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'target user does not exist'
                });
                return;
            }
            user = rows[0];
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("DELETE FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
            request.body.target_user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'fail to remove user from home'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'user successfully removed from home'
            });
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        const message = {
            notification: { 
                title: `You Has Remove From Home ${home.home_name}`, 
                body: `Good Bye`
            }
        }

        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        }

        admin.messaging().sendToDevice(user.user_notification_token, message, options)
        .then((response) => {
            console.log("message sent successfully")
        }).catch((error) => {
            console.error(error);
        });

        connection.end();
        return;
    });
}