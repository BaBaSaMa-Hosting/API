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
    // get list of item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/item/list', async function (request, reply) {
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
            request.query.home
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE UIH.user_id = ? AND home_id = ?", [
            request.query.user_id, request.query.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND active = 1", [
            request.query.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'home does not have any item.'
                });
                return;
            }

            reply.send({
                output: 'success',
                items: rows
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
    // create new item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/create', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_name === undefined || request.body.item_name === null) {
            reply.send({
                output: 'error',
                message: 'item name is not passed in.'
            });
            return;
        }

        if (request.body.item_description === undefined || request.body.item_description === null) {
            reply.send({
                output: 'error',
                message: 'item description is not passed in.'
            });
            return;
        }

        if (request.body.item_image === undefined || request.body.item_image === null) {
            reply.send({
                output: 'error',
                message: 'item image is not passed in.'
            });
            return;
        }

        if (request.body.item_cost === undefined || request.body.item_cost === null) {
            reply.send({
                output: 'error',
                message: 'item cost is not passed in.'
            });
            return;
        }

        if (request.body.item_stock === undefined || request.body.item_stock === null) {
            reply.send({
                output: 'error',
                message: 'item stock is not passed in.'
            });
            return;
        }

        if (request.body.category_id === undefined || request.body.category_id === null) {
            reply.send({
                output: 'error',
                message: 'item category is not passed in.'
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        let new_item_id = uuidv4();

        connection.promise().query("INSERT INTO Items (home_id, item_id, item_name, item_description, item_image, item_cost, item_stock, item_expiry_date, item_category, item_limit, created_by, created_on, updated_by, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?, DEFAULT);", [
            request.body.home_id, new_item_id, request.body.item_name, request.body.item_description, request.body.item_image, request.body.item_cost, request.body.item_stock, request.body.expiry_date, request.body.category_id, request.body.item_limit, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'successfully added new item'
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
    // update item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/update', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_name === undefined || request.body.item_name === null) {
            reply.send({
                output: 'error',
                message: 'item name is not passed in.'
            });
            return;
        }

        if (request.body.item_description === undefined || request.body.item_description === null) {
            reply.send({
                output: 'error',
                message: 'item description is not passed in.'
            });
            return;
        }

        if (request.body.item_image === undefined || request.body.item_image === null) {
            reply.send({
                output: 'error',
                message: 'item image is not passed in.'
            });
            return;
        }

        if (request.body.item_cost === undefined || request.body.item_cost === null) {
            reply.send({
                output: 'error',
                message: 'item cost is not passed in.'
            });
            return;
        }

        if (request.body.item_stock === undefined || request.body.item_stock === null) {
            reply.send({
                output: 'error',
                message: 'item stock is not passed in.'
            });
            return;
        }

        if (request.body.expiry_date === undefined || request.body.expiry_date === null) {
            reply.send({
                output: 'error',
                message: 'item expiry date is not passed in.'
            });
            return;
        }

        if (request.body.category_id === undefined || request.body.category_id === null) {
            reply.send({
                output: 'error',
                message: 'item category is not passed in.'
            });
            return;
        }

        if (request.body.item_limit === undefined || request.body.item_limit === null) {
            reply.send({
                output: 'error',
                message: 'item limit is not passed in.'
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE UIH.user_id = ? AND home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Items SET item_name = ?, item_description = ?, item_image = ?, item_cost = ?, item_stock = ?, item_expiry_date = ?, item_category = ?, item_limit = ?, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.item_name, request.body.item_description, request.body.item_image, request.body.item_cost, request.body.item_stock, request.body.expiry_date, request.body.category_id, request.body.item_limit, request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'successfully updated item'
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
    // increase item stock
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/increase', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE UIH.user_id = ? AND home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Items SET item_stock = item_stock + 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'successfully updated item'
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
    // decrease item stock
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/decrease', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE UIH.user_id = ? AND home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                });
                return;
            }

            if (rows[0].item_stock === 0) {
                reply.send({
                    output: 'error',
                    message: 'item already reach 0.'
                });
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Items SET item_stock = item_stock - 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                });
                return;
            }

            if (rows[0].item_limit >= rows[0].item_stock) {
                //alert the family, send notification

            }

            reply.send({
                output: 'success',
                message: 'item successfully updated'
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
    // disable item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/disable', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE UIH.user_id = ? AND home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Items SET active = 0, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'successfully updated item'
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
    // enable item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/enable', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
            return;
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
            request.body.home_id
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

        connection.promise().query("SELECT * FROM User_In_Home WHERE UIH.user_id = ? AND home_id = ?", [
            request.body.user_id, request.body.home_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'user does not belong to home.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                });
                return;
            }
        }).catch((error) => {
            reply.send({
                output: "error",
                message: error.message
            });
        });

        connection.promise().query("UPDATE Items SET active = 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
                return;
            }

            reply.send({
                output: 'success',
                message: 'successfully updated item'
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