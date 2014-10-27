var RED = require("node-red");
var request = require("request");
module.exports = function(RED) {
    function trafikantenFetcher(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
		this.url = undefined;
        this.on("input", function(msgArr) {
			if (msgArr.topic == "trafikanten-favourite-config-array") {
				if (!msgArr.payload) {
					_this.warn("No payload in incoming message", msgArr);
					return;
				}
				if (!Array.isArray(msgArr.payload)) {
					msgArr.payload = [msgArr.payload];
				}
				_this.url = "http://reisapi.ruter.no/Favourites/GetFavourites?favouritesRequest=";
				_this.favouriteConfigs = [];
				for (var i = 0; i < msgArr.payload.length; i++) {
					var msg = msgArr.payload[i];
					if (msg.payload.config) {
						_this.favouriteConfigs.push(msg.payload.config);
					}
				}
				if (_this.favouriteConfigs.length > 0) {
					_this.fetch(_this.url + _this.favouriteConfigs.join(","));
				} else {
					_this.send({});
				}
			} else if (msgArr.topic == "inject") {
				if (_this.favouriteConfigs.length > 0) {
					_this.fetch(_this.url + _this.favouriteConfigs.join(","));
				} else {
					_this.send({});
				}
			}
        });
        this.fetch = function(url) {
            this.status({fill:"green",shape:"ring",text:"Fetching data"});
            var msg = {};
            msg.url = url;
            msg.topic = "trafikanten-departures";
            var _this = this;
            request({url:url, json:true}, function(error, response, body) {
                if (!error  && response.statusCode == 200) {
                    var departures = [];
                    for (var i = 0; i < body.length; i++) {
                        var destinationObj = body[i];
                        for (var j = 0; j < destinationObj["MonitoredStopVisits"].length; j++) {
                            var trafikantenJourney = destinationObj["MonitoredStopVisits"][j]["MonitoredVehicleJourney"];
                            var departure = {
                                "line": destinationObj["LineID"],
                                "destination": trafikantenJourney["MonitoredCall"]["DestinationDisplay"],
                                "dateStr": trafikantenJourney["MonitoredCall"]["ExpectedDepartureTime"],
                                "time": Date.parse(trafikantenJourney["MonitoredCall"]["ExpectedDepartureTime"])
                            };
                            departures.push(departure);
                        }
                    }
                    msg.payload = departures;
                    _this.status({fill:"green",shape:"dot",text:"Done"});
                } else {
                    _this.status({fill:"red",shape:"dot",text:"Error"});
                    msg.payload = {};
                    msg.error = error;
                    msg.statusCode = response ? response.statusCode : undefined

                }
                _this.send(msg);
            });
        }
    }
    RED.nodes.registerType("trafikanten-fetcher", trafikantenFetcher);
};