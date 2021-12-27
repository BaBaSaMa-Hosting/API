const dotenv = require('dotenv');

module.exports = async (fastify, opts) => {
    const buf = Buffer.from('BASIC=basic')
    const config = dotenv.parse(buf, {
        path: './mysql.env'
    })

    fastify.register(require('fastify-mysql'), {
        connectionString: `mysql://${config.username}@${config.host}/${config.database}`
    })

    fastify.get('/home_management/login', async function (request, reply) {
        fastify.mysql.getConnection(onConnect)

        let client;
        const onConnect = (error, client) => {
            if (error) return reply.send(error);
            client = client
        }

        client.query('SELECT * FROM Users',
            [],
            onResult = (err, result) => {
                client.release()
                reply.send(err || result)
            }
        )
    });
}