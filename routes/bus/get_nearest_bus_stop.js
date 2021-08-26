const fetch = require('../../../node_modules/node-fetch');

module.exports = async (fastify, opts) => {
    fastify.get('/get_nearest_bus_stop/:lat/:long/:amountReturn', (request, reply) => {
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
                        data.push(i)
                        let lat = Math.abs(request.params.lat - i.Latitude);
                        let long = Math.abs(request.params.long - i.Longitude);
                        let near = lat + long;
                        if (nearest.length > 0) {
                            for (let n = 0; n < nearest.length; n++) {
                                const element = nearest[n].Distance;
                                if (n == 0 && element > near)
                                    nearest.unshift({
                                        'BusStopCode': i.BusStopCode,
                                        'Distance': near
                                    });
                                else if (n == nearest.length)
                                    nearest.push({
                                        'BusStopCode': i.BusStopCode,
                                        'Distance': near
                                    });
                                else if (element < near && nearest[n++].Distance > near)
                                    nearest.splice(0, n++, {
                                        'BusStopCode': i.BusStopCode,
                                        'Distance': near
                                    });
                            }
                        } else
                            nearest.push({
                                'BusStopCode': i.BusStopCode,
                                'Distance': near
                            });
                    });
                    count += 500;
                    getData();
                } else
                    reply.send("no data retrieved");
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
                            data.push(i)
                            let lat = Math.abs(request.params.lat - i.Latitude);
                            let long = Math.abs(request.params.long - i.Longitude);
                            let near = lat + long;
                            if (nearest.length > 0) {
                                for (let n = 0; n < nearest.length; n++) {
                                    const element = nearest[n].Distance;
                                    if (n == 0 && element > near)
                                        nearest.unshift({
                                            'BusStopCode': i.BusStopCode,
                                            'Distance': near
                                        });
                                    else if (n == nearest.length)
                                        nearest.push({
                                            'BusStopCode': i.BusStopCode,
                                            'Distance': near
                                        });
                                    else if (element < near && nearest[n++].Distance > near)
                                        nearest.splice(0, n++, {
                                            'BusStopCode': i.BusStopCode,
                                            'Distance': near
                                        });
                                }
                            } else
                                nearest.push({
                                    'BusStopCode': i.BusStopCode,
                                    'Distance': near
                                });
                        });
                        count += 500;
                        getData();
                    } else
                        displayData()
                })
        }

        const displayData = () => {
            let returnData = [];
            for (let i = 0; i < request.params.amountReturn; i++) {
                data.some(n => {
                    if (n.BusStopCode == nearest[i].BusStopCode) {
                        returnData.push(n)
                        return;
                    }
                });
            }
            reply.send(returnData)
        }
    })
}
