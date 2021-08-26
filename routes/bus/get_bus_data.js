const fetch = require('../../../node_modules/node-fetch');

module.exports = async (fastify, opts) => {
    fastify.get('/get_bus_data/:ServiceNo', (request, reply) => {
        const url = "http://datamall2.mytransport.sg/ltaodataservice/BusServices"
        var count = 0;
        fetch(url, {
                method: "GET",
                headers: {
                    'AccountKey': `${request.headers.api_key}`
                }
            }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.value.length !== 0) {
                    responseJson.value.forEach(i => {
                        if (request.params.ServiceNo === i.ServiceNo)
                            reply.send([i]);
                    });
                    count += 500;
                    getNext();
                } else
                    reply.send(["no data found"]);
            }).catch((error) => console.warn(error))

        const getNext = () => {
            let newurl = url + `?$skip=${count}`;
            fetch(newurl, {
                    method: "GET",
                    headers: {
                        'AccountKey': `${request.headers.api_key}`
                    }
                }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.value.length !== 0) {
                        responseJson.value.forEach(i => {
                            if (request.params.ServiceNo === i.ServiceNo)
                                reply.send([i]);
                        });
                        count += 500;
                        getNext();
                    } else
                        reply.send(["no data found"]);
                }).catch((error) => console.warn(error))
        }
    });
}
