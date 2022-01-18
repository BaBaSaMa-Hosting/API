const dotenv = require('dotenv').config({
    path: '/var/www/Main/API/routes/home_management/mysql.env',
    debug: true
});
const mysql = require('mysql2');
const {
    v4: uuidv4
} = require('uuid');

const { check_user_exist, check_home_exist, check_user_in_home, check_category_in_home, adding_category_into_home } = require('./common_query');

module.exports = async (fastify, opts) => {
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get list of category
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/category/list', async function (request, reply) {
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

        await connection.promise().query("SELECT * FROM Home_Have_Item_Category HHIC INNER JOIN Item_Category IC ON HHIC.category_id = IC.category_id WHERE HHIC.home_id = ? AND HHIC.active != 0", [
            request.query.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not have any category'
                });

                connection.end();
                return;
            }

            rows.forEach((i, index) => {
                let buffer  = new Buffer(i.category_image, 'base64');
                rows[index].category_image = buffer.toString();
            });

            reply.send({
                output: "success",
                categories: rows
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
    // add category to home
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/category/add', async function (request, reply) {
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
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.category_id === undefined || request.body.category_id === null) {
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

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        await connection.promise().query("SELECT * FROM Item_Category WHERE category_id = ?", [
            request.body.category_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'category does not exist'
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

        if (!await adding_category_into_home(reply, connection, request.body.home_id, request.body.user_id, request.body.category_id)) return;

        reply.send({
            output: 'success',
            message: 'successfully added category to home'
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // create new category
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/category/create', async function (request, reply) {
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
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.category_name === undefined || request.body.category_name === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.category_image === undefined || request.body.category_image === null) {
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

        if (!await check_home_exist(reply, connection, request.body.home_id)) return;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return;

        await connection.promise().query("SELECT * FROM Item_Category WHERE category_name = ?", [
            request.body.category_name
        ]).then(([rows, fields]) => {
            if (rows.length > 0) {
                reply.send({
                    output: 'error',
                    message: 'category name already exist'
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

        let new_category_id = uuidv4();

        await connection.promise().query("INSERT INTO Item_Category (category_id, category_name, category_image) VALUES (?, ?, ?)", [
            new_category_id, request.body.category_name, request.body.category_image
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'category creation failed'
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

        if (!await adding_category_into_home(reply, connection, request.body.home_id, request.body.user_id, new_category_id)) return;

        reply.send({
            output: 'success',
            message: 'category creation success',
            home_id: new_category_id
        });

        connection.end();
        return;
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // update category
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/category/update', async function (request, reply) {
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

        if (request.body.category_id === undefined || request.body.category_id === null) {
            reply.send({
                output: 'error',
                message: 'category id is not passed in.'
            });
            return;
        }

        if (request.body.category_name === undefined || request.body.category_name === null) {
            reply.send({
                output: 'error',
                message: 'category name is not passed in.'
            });
            return;
        }

        if (request.body.category_image === undefined || request.body.category_image === null) {
            reply.send({
                output: 'error',
                message: 'category image is not passed in.'
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
        
        if (!await check_category_in_home(reply, connection, request.body.home_id, request.body.category_id)) return;

        await connection.promise().query("UPDATE Item_Category SET category_name = ?, category_image = ? WHERE category_id = ?", [
            request.body.category_name, request.body.category_image, request.body.category_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'item category update failure'
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

        await connection.promise().query("UPDATE Home_Have_Item_Category SET updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND category_id = ?", [
            request.body.user_id, request.body.home_id, request.body.category_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'home have category update failure'
                });

                connection.end();
                return;
            }

            reply.send({
                output: 'success',
                message: 'category update successfully'
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
    // disable category
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/category/disable', async function (request, reply) {
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

        if (request.body.category_id === undefined || request.body.category_id === null) {
            reply.send({
                output: 'error',
                message: 'category id is not passed in.'
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

        if (!await check_category_in_home(reply, connection, request.body.home_id, request.body.category_id)) return;

        connection.promise().query("UPDATE Home_Have_Item_Category SET active = 0, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND category_id = ?", [
            request.body.user_id, request.body.home_id, request.body.category_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'item category disabled failure'
                });

                connection.end();
                return;
            }

            reply.send({
                output: 'success',
                message: 'item category disabled success'
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
    // enable category
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/category/enable', async function (request, reply) {
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

        if (request.body.category_id === undefined || request.body.category_id === null) {
            reply.send({
                output: 'error',
                message: 'category id is not passed in.'
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

        if (!await check_category_in_home(reply, connection, request.body.home_id, request.body.category_id)) return;

        await connection.promise().query("UPDATE Home_Have_Item_Category SET active = 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND category_id = ?", [
            request.body.user_id, request.body.home_id, request.body.category_id
        ]).then(([rows, fields]) => {
            if (rows.affectedRows === 0) {
                reply.send({
                    output: 'error',
                    message: 'item category enable failure'
                });

                connection.end();
                return;
            }

            reply.send({
                output: 'success',
                message: 'item category enable success'
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
}