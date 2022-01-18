module.exports.get_user_details = async (reply, connection, user_id) => {
    await connection.promise().query("SELECT * FROM Users WHERE user_id = ?", [
        user_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'user does not exist.'
            });
            connection.end();
            return [];
        }

        return rows;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });
        
        connection.end();
        return [];
    });
}

module.exports.get_home_details = async (reply, connection, home_id) => {
    await connection.promise().query("SELECT * FROM Homes WHERE home_id = ?", [
        home_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'home does not exist.'
            });

            connection.end();
            return [];
        }

        rows.forEach(i => {
            let buffer  = new Buffer(i.home_image, 'base64');
            rows[index].home_image = buffer.toString();
        });

        return rows;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return [];
    });
}

module.exports.get_home_users_details = async (reply, connection, home_id, user_id) => {
    await connection.promise().query("SELECT * FROM User_In_Home UIH INNER JOIN Users U ON UIH.user_id = U.user_id WHERE UIH.home_id = ?", [
        user_id, home_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'user does not belong to home.'
            });

            connection.end();
            return [];
        }

        return rows;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return [];
    });
}

module.exports.get_item_details = async (reply, connection, item_id, home_id) => {
    await connection.promise().query("SELECT * FROM Items WHERE home_id = ? AND item_id = ?", [
        home_id, item_id
    ]).then(([rows, fields]) => {
        if (rows.length === 0) {
            reply.send({
                output: 'error',
                message: 'item does not exist.'
            });
            
            connection.end();
            return [];
        }

        return rows;
    }).catch((error) => {
        reply.send({
            output: "error",
            message: error.message
        });

        connection.end();
        return [];
    });
}