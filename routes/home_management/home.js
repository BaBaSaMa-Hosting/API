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

        connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Homes H ON UIH.home_id = H.home_id WHERE UIH.user_id = ? AND invitation_status != 'Exited'", [
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE user_id != ? AND home_id = ?", [
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
    // update name
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/home/update_name', async function (request, reply) {
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

        connection.promise().query("UPDATE Homes SET home_name = ? WHERE home_id = ?", [
            request.body.home_name, request.body.home_id
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

        connection.end();
        return;
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
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE User_In_Home SET invitation_status = ? WHERE user_id = ?", [
            'Exited', request.body.target_user_id
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
                message: 'user successfully added into home'
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
}