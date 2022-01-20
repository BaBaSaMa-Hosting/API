const dotenv = require('dotenv').config({
    path: '/var/www/Main/API/routes/home_management/mysql.env',
    debug: true
});
const mysql = require('mysql2');
const {
    v4: uuidv4
} = require('uuid');

const { check_user_exist, check_home_exist, check_user_in_home, check_item_exist } = require('./common_query');
const { get_user_details, get_home_details, get_home_users_details } = require('./notification_information');
const { admin } = require('./firebase_config');

module.exports = async (fastify, opts) => {
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // get list of item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.get('/home_management/item/list', async function (request, reply) {
        if (request.query.user_id === undefined || request.query.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.query.home_id === undefined || request.query.home_id === null) {
            return reply.send({
                output: 'error',
                message: 'home id is not passed in.'
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

        if (!await check_home_exist(reply, connection, request.query.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.query.home_id, request.query.user_id)) return reply;

        await connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND active = 1", [
            request.query.home_id
        ]).then(([rows, fields]) => {
            connection.end();

            if (rows.length === 0) {
                return reply.send({
                    output: 'error',
                    message: 'home does not have any item.'
                });
            }

            new Promise((resolve, reject) => {
                rows.forEach((i, index) => {
                    let buffer  = new Buffer(i.item_image, 'base64');
                    rows[index].item_image = buffer.toString();

                    if (index === rows.length) resolve();
                });
            }).then(() => {
                return reply.send({
                    output: 'success',
                    items: rows
                });
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
    // create new item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/create', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            }); 
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            }); 
        }

        if (request.body.item_name === undefined || request.body.item_name === null) {
            return reply.send({
                output: 'error',
                message: 'item name is not passed in.'
            });
        }

        if (request.body.item_description === undefined || request.body.item_description === null) {
            return reply.send({
                output: 'error',
                message: 'item description is not passed in.'
            });
        }

        if (request.body.item_image === undefined || request.body.item_image === null) {
            return reply.send({
                output: 'error',
                message: 'item image is not passed in.'
            });
        }

        if (request.body.item_cost === undefined || request.body.item_cost === null) {
            return reply.send({
                output: 'error',
                message: 'item cost is not passed in.'
            });
        }

        if (request.body.item_stock === undefined || request.body.item_stock === null) {
            return reply.send({
                output: 'error',
                message: 'item stock is not passed in.'
            });
        }

        if (request.body.category_id === undefined || request.body.category_id === null) {
            return reply.send({
                output: 'error',
                message: 'item category is not passed in.'
            });
        }
        
        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        if (!await check_user_exist(reply, connection, request.body.user_id)) return reply;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return reply;

        let new_item_id = uuidv4();

        connection.promise().query("INSERT INTO Items (home_id, item_id, item_name, item_description, item_image, item_cost, item_stock, item_expiry_date, item_category, item_limit, created_by, created_on, updated_by, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?, DEFAULT);", [
            request.body.home_id, new_item_id, request.body.item_name, request.body.item_description, request.body.item_image, request.body.item_cost, request.body.item_stock, request.body.expiry_date, request.body.category_id, request.body.item_limit, request.body.user_id, request.body.user_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();

                return reply.send({
                    output: 'error',
                    message: 'item creation failure.'
                });
            }
        }).catch((error) => {
            connection.end();

            reply.send({
                output: "error",
                message: error.message
            });
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return reply;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return reply;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return reply;

        const message = {
            notification: { 
                title: `${home[0].home_name} Have New Item!`, 
                body: `${request.body.item_name} Has Been Created By ${user[0].display_name}`
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

        connection.end();

        return reply.send({
            output: 'success',
            message: 'successfully added created new item'
        });
    });
    
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // update item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/update', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.item_name === undefined || request.body.item_name === null) {
            return reply.send({
                output: 'error',
                message: 'item name is not passed in.'
            });
        }

        if (request.body.item_description === undefined || request.body.item_description === null) {
            return reply.send({
                output: 'error',
                message: 'item description is not passed in.'
            });
        }

        if (request.body.item_image === undefined || request.body.item_image === null) {
            return reply.send({
                output: 'error',
                message: 'item image is not passed in.'
            });
        }

        if (request.body.item_cost === undefined || request.body.item_cost === null) {
            return reply.send({
                output: 'error',
                message: 'item cost is not passed in.'
            });
        }

        if (request.body.item_stock === undefined || request.body.item_stock === null) {
            return reply.send({
                output: 'error',
                message: 'item stock is not passed in.'
            });
        }

        if (request.body.expiry_date === undefined || request.body.expiry_date === null) {
            return reply.send({
                output: 'error',
                message: 'item expiry date is not passed in.'
            });
        }

        if (request.body.category_id === undefined || request.body.category_id === null) {
            return reply.send({
                output: 'error',
                message: 'item category is not passed in.'
            });
        }

        if (request.body.item_limit === undefined || request.body.item_limit === null) {
            return reply.send({
                output: 'error',
                message: 'item limit is not passed in.'
            });
        }
        
        const connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        connection.connect();

        if (!await check_user_exist(reply, connection, request.body.user_id)) return reply;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return reply;

        if (!await check_item_exist(reply, connection, request.body.home_id, request.body.item_id)) return reply;

        await connection.promise().query("UPDATE Items SET item_name = ?, item_description = ?, item_image = ?, item_cost = ?, item_stock = ?, item_expiry_date = ?, item_category = ?, item_limit = ?, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.item_name, request.body.item_description, request.body.item_image, request.body.item_cost, request.body.item_stock, request.body.expiry_date, request.body.category_id, request.body.item_limit, request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();

                return reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
            }
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            });
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return reply;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return reply;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return reply;

        const message = {
            notification: { 
                title: `${item[0].item_name} Has Been Updated!`, 
                body: `Home ${home[0].home_name} Item ${item[0].item_name} Have Been Updated By ${user[0].display_name}.`
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
        connection.end();

        return reply.send({
            output: 'success',
            message: 'successfully updated item'
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // increase item stock
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/increase', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        if (!await check_user_exist(reply, connection, request.body.user_id)) return reply;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return reply;

        if (!await check_item_exist(reply, connection, request.body.home_id, request.body.item_id)) return reply;

        await connection.promise().query("UPDATE Items SET item_stock = item_stock + 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            connection.end();
            
            if (rows.length === 0) {
                return reply.send({
                    output: 'error',
                    message: 'item failed to update'
                }); 
            }

            return reply.send({
                output: 'success',
                message: 'successfully updated item'
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
    // decrease item stock
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/decrease', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        if (!await check_user_exist(reply, connection, request.body.user_id)) return reply;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return reply;

        if (!await check_item_exist(reply, connection, request.body.home_id, request.body.item_id)) return reply;

        await connection.promise().query("UPDATE Items SET item_stock = item_stock - 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ? AND item_stock != 0", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();
                
                return reply.send({
                    output: 'error',
                    message: 'item failed to update'
                }); 
            }
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            }); 
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return reply;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return reply;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return reply;

        await connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
            request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();
                
                return reply.send({
                    output: 'error',
                    message: 'item does not exist.'
                }); 
            }

            if (rows[0].item_limit > rows[0].item_stock) {
                const message = {
                    notification: { 
                        title: `${item[0].item_name} Gone Below a Set Limit`, 
                        body: `Home ${home[0].home_name} Item ${item[0].item_name} Have Only ${item[0].item_stock} Left.`
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
            }
            connection.end();
                
            return reply.send({
                output: 'success',
                message: 'item successfully updated'
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
    // disable item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/disable', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        if (!await check_user_exist(reply, connection, request.body.user_id)) return reply;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return reply;

        if (!await check_item_exist(reply, connection, request.body.home_id, request.body.item_id)) return reply;

        await connection.promise().query("UPDATE Items SET active = 0, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();
                
                return reply.send({
                    output: 'error',
                    message: 'item failed to update'
                }); 
            }
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            }); 
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return reply;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return reply;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return reply;

        const message = {
            notification: { 
                title: `${item[0].item_name} Has Been Disabled`, 
                body: `Home ${home[0].home_name} Item ${item[0].item_name} Have Been Disabled By ${user[0].display_name}.`
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
        connection.end();

        return reply.send({
            output: 'success',
            message: 'successfully updated item'
        });
    });

    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    // enable item
    // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
    fastify.post('/home_management/item/enable', async function (request, reply) {
        if (request.body.user_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.home_id === undefined || request.body.user_id === null) {
            return reply.send({
                output: 'error',
                message: 'user id is not passed in.'
            });
        }

        if (request.body.item_id === undefined || request.body.item_id === null) {
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

        if (!await check_user_exist(reply, connection, request.body.user_id)) return reply;

        if (!await check_home_exist(reply, connection, request.body.home_id)) return reply;

        if (!await check_user_in_home(reply, connection, request.body.home_id, request.body.user_id)) return reply;

        if (!await check_item_exist(reply, connection, request.body.home_id, request.body.item_id)) return reply;

        await connection.promise().query("UPDATE Items SET active = 1, updated_by = ?, updated_on = CURRENT_TIMESTAMP WHERE home_id = ? AND item_id = ?", [
            request.body.user_id, request.body.home_id, request.body.item_id
        ]).then(([rows, fields]) => {
            if (rows.length === 0) {
                connection.end();
                
                return reply.send({
                    output: 'error',
                    message: 'item failed to update'
                });
            }
        }).catch((error) => {
            connection.end();
            
            return reply.send({
                output: "error",
                message: error.message
            });
        });

        const user = await get_user_details(reply, connection, request.body.user_id);
        if (user.length === 0) return reply;

        const home = await get_home_details(reply, connection, request.body.home_id);
        if (home.length === 0) return reply;

        const users = await get_home_users_details(reply, connection, request.body.home_id, request.body.user_id);
        if (users.length === 0) return reply;

        const message = {
            notification: { 
                title: `${item[0].item_name} Has Been Enabled`, 
                body: `Home ${home[0].home_name} Item ${item[0].item_name} Have Been Enabled By ${user[0].display_name}.`
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
        connection.end();

        return reply.send({
            output: 'success',
            message: 'successfully updated item'
        }); 
    });
}