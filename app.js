const path = require('path');
const fastify = require('fastify') ({
    logger: true
});

fastify.get('/', async (request, reply) => {
    reply.send("api.babasama.com")
});

// fastify.register(require('./routes/bus/get_bus_route'));
// fastify.register(require('./routes/bus/get_nearest_bus_stop'));
// fastify.register(require('./routes/bus/get_bus_arrival'));
// fastify.register(require('./routes/bus/get_bus_stop_data'));
// fastify.register(require('./routes/bus/get_bus_data'));
fastify.register(require('./routes/get_random_quote'));

fastify.register(require('./routes/home-management/login'));

const start = async() => {
    await fastify.register(require('middie'))
    fastify.use(require('cors')())

    await fastify.listen(3003, '0.0.0.0')
    .then((address) => console.log(`server is listening on ${address}`))
    .catch(err => {
        console.log('error starting server: ', err);
        process.exit(1);
    })
    
}
start();
