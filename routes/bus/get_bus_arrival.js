const fetch = require('../../../node_modules/node-fetch');

module.exports = async (fastify, opts) => {
    fastify.get('/get_bus_arrival/:BusStopCode', (request, reply) => {
        var data = [];
        var returnData = [];
        const url = `http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${request.params.BusStopCode}`;
        fetch(url, {
                method: "GET",
                headers: {
                    'AccountKey': `${request.headers.api_key}`
                }
            }).then((response) => response.json())
            .then((responseJson) => {
                data = responseJson.Services;
                reconfig();
            });

        const reconfig = () => {
            data.forEach(i => {
                let nextBus = [];
                let n = i.NextBus;
                let diff = Math.round((((new Date(n.EstimatedArrival).getTime()) - Date.now()) / 1000) / 60);
                if (diff < 0) {
                    diff = "arr"
                }
                if (n.EstimatedArrival !== "") {
                    nextBus.push({
                        OriginCode: n.OriginCode,
                        DestinationCode: n.DestinationCode,
                        EstimatedArrival: diff,
                        Latitude: n.Latitude,
                        Longitude: n.Longitude,
                        VisitNumber: n.VisitNumber,
                        Load: n.Load,
                        Feature: n.Feature,
                        Type: n.Type
                    });
                }
                n = i.NextBus2
                diff = Math.round((((new Date(n.EstimatedArrival).getTime()) - Date.now()) / 1000) / 60);
                if (diff < 0)
                    diff = "arr"
                if (n.EstimatedArrival !== "") {
                    nextBus.push({
                        OriginCode: n.OriginCode,
                        DestinationCode: n.DestinationCode,
                        EstimatedArrival: diff,
                        Latitude: n.Latitude,
                        Longitude: n.Longitude,
                        VisitNumber: n.VisitNumber,
                        Load: n.Load,
                        Feature: n.Feature,
                        Type: n.Type
                    });
                }
                n = i.NextBus3
                diff = Math.round((((new Date(n.EstimatedArrival).getTime()) - Date.now()) / 1000) / 60);
                if (diff < 0)
                    diff = "arr"
                if (n.EstimatedArrival !== "") {
                    nextBus.push({
                        OriginCode: n.OriginCode,
                        DestinationCode: n.DestinationCode,
                        EstimatedArrival: diff,
                        Latitude: n.Latitude,
                        Longitude: n.Longitude,
                        VisitNumber: n.VisitNumber,
                        Load: n.Load,
                        Feature: n.Feature,
                        Type: n.Type
                    });
                }
                returnData.push({
                    ServiceNo: i.ServiceNo,
                    Operator: i.Operator,
                    NextBus: nextBus
                });
            });
            reply.send(returnData);
        }
    });
}
