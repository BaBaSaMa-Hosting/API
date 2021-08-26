const fetch = require('../../../node_modules/node-fetch');

module.exports = async (fastify, opts) => {
    fastify.get('/get_bus_stop_data/:BusStopCode', (request, reply) => {
        const data = [];
        const nearest = [];
        var count = 0;
        const url = "http://datamall2.mytransport.sg/ltaodataservice/BusStops";
        fetch(url, {
                method: "GET",
                headers: {
                    'AccountKey': `${request.headers.api_key}`
                }
            }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.value.length > 0) {
                    responseJson.value.forEach(i => {
                        if (i.BusStopCode === request.params.BusStopCode)
                            reply.send([i])
                    });
                    count += 500;
                    getData();
                } else
                    reply.send(["no data found"]);
            })
            .catch((error) => console.warn(error))

        const getData = () => {
            var newurl = url + `?$skip=${count}`;
            fetch(newurl, {
                    method: "GET",
                    headers: {
                        'AccountKey': `${request.headers.api_key}`
                    }
                }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.value.length > 0) {
                        responseJson.value.forEach(i => {
                            if (i.BusStopCode === request.params.BusStopCode)
                                reply.send([i])
                        });
                        count += 500;
                        getData();
                    } else
                        reply.send(["no data found"]);
                })
        }
    })
}
