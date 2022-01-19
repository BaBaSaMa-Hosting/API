const check_user_exist = async (reply, connection, user_id) => {
    let value = false;
    await connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
        user_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'user does not exist.'
            });
            connection.end();
            return value;
        }

        value = true
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });
        
        connection.end();
        return value;
    });

    return value;
}

const check_home_exist = async (reply, connection, home_id) => {
    let value = false;

    await connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
        home_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'home does not exist.'
            });

            connection.end();
            return value;
        }

        value = true;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return value;
    });

    return value;
}

const check_user_in_home = async (reply, connection, home_id, user_id) => {
    let value = false;
    await connection.promise().query("SELECT * FROM User_In_Home WHERE user_id = ? AND home_id = ?", [
        user_id, home_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'user does not belong to home.'
            });

            connection.end();
            return value;
        }

        value = true;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return value;
    });

    return value;
}

const check_item_exist = async (reply, connection, home_id, item_id) => {
    let value = false;
    await connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
        home_id, item_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'item does not exist.'
            });

            connection.end();
            return value;
        }

        value = true;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return value;
    });

    return value;
}

const check_category_in_home = async (reply, connection, home_id, category_id) => {
    let value = false;
    await connection.promise().query("SELECT * FROM Home_Have_Item_Category WHERE home_id = ? AND category_id = ?", [
        home_id, category_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'category does not belong in home.'
            });

            connection.end();
            return value;
        }

        value = true
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return value;
    });

    return value;
}

const adding_category_into_home = async (reply, connection, home_id, user_id, category_id) => {
    let value = false;
    await connection.promise().query("INSERT INTO Home_Have_Item_Category (home_id, category_id, active, created_by, created_on, updated_by, updated_on)VALUES (?, ?, DEFAULT, ?, DEFAULT, ?, DEFAULT)", [
        home_id, category_id, user_id, user_id
    ]).then(([rows, fields]) => {
        if (rows.affectedRows === 0) {
            reply.send({
                output: 'error',
                message: 'adding category to home failed'
            });

            connection.end();
            return value;
        }
        
        value = true;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return value;
    });
    return value;
}

module.exports = {
    check_user_exist, 
    check_home_exist, 
    check_item_exist, 
    check_user_in_home,
    check_category_in_home,
    adding_category_into_home
}