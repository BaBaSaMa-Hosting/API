const fetch = require('../../../node_modules/node-fetch');

module.exports = async (fastify, opts) => {
    fastify.get('/get_bus_route/:ServiceNo', (request, reply) => {
        const url = "http://datamall2.mytransport.sg/ltaodataservice/BusRoutes";
        const data = [];
        const busstopdata = [];
        const result = [];
        var count = 0;

        fetch(url, {
                method: "GET",
                headers: {
                    'AccountKey': `${request.headers.api_key}`
                }
            }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.value.length > 0) {
                    responseJson.value.forEach(i => {
                        switch (Number(i.ServiceNo)) {
                            case Number(request.params.ServiceNo):
                                data.push(i);
                        }
                    });
                    count += 500;
                    nextData();
                } else
                    reply.send("no data retrieved");
            });

            const nextData = () => {
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
                                switch (Number(i.ServiceNo)) {
                                    case Number(request.params.ServiceNo):
                                        data.push(i);
                                }
                            });
                            count += 500;
                            nextData();
                        } else
                            getBusStopData(0);
                    })
            }
    
            const getBusStopData = (newCount) => {
                var busstopdataurl = `http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${newCount}`;
                fetch(busstopdataurl, {
                    method: "GET",
                    headers: {
                        'AccountKey': `${request.headers.api_key}`
                    }
                }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.value.length > 0) {
                        responseJson.value.forEach(i => {
                            busstopdata.push(i);
                        });
                        getBusStopData(newCount += 500);
                    } else
                        addData();
                })
                .catch((error) => console.warn(error))
            }
    
            const addData = () => {
                data.forEach(i => {
                    busstopdata.forEach(n => {
                        if (i.BusStopCode === n.BusStopCode) {
                            result.push({ServiceNo: i.ServiceNo, Operator: i.Operator, Direction: i.Direction, StopSequence: i.StopSequence, BusStopCode: i.BusStopCode, Distance: i.Distance, WD_FirstBus: i.WD_FirstBus, WD_LastBus: i.WD_LastBus, SAT_FirstBus: i.SAT_FirstBus, SAT_LastBus: i.SAT_LastBus, SUN_FirstBus: i.SUN_FirstBus, SUN_LastBus: i.SUN_LastBus, BusStopCode: n.BusStopCode, RoadName: n.RoadName, Description: n.Description, Latitude: n.Latitude, Longitude: n.Longitude})
                        }
                    });
                });
                if (result.length > 0) 
                    reply.send(result);
                else 
                    reply.send("no data was found");
            }
    })
}
