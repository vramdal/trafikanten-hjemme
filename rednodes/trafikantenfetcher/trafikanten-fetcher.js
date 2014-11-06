var RED = require("node-red");
var request = require("request");
module.exports = function(RED) {
    function trafikantenFetcher(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
		this.url = undefined;
        this.interval = parseInt(config["interval"], 10);
        this.intervalHandle = undefined;
        _this.status({fill:"yellow",shape:"dot",text:"Waiting for specs"});
        this.on("input", function(msgArr) {
			if (msgArr.topic == "trafikanten-favourite-configs-array") {
				if (!msgArr.payload) {
					_this.warn("No payload in incoming message", msgArr);
					return;
				}
				if (!Array.isArray(msgArr.payload)) {
					msgArr.payload = [msgArr.payload];
				}
				_this.url = "http://reisapi.ruter.no/Favourites/GetFavourites?favouritesRequest=";
				_this.favouriteConfigs = [];
                for (var outer = 0; outer < msgArr.payload.length; outer++) {
                    var favouriteConfigArr = msgArr.payload[outer].payload;
                    for (var inner = 0; inner < favouriteConfigArr.length; inner++) {
                        var favourite = favouriteConfigArr[inner];
                        _this.favouriteConfigs.push(favourite.stationId + "-" + favourite.line + "-" + favourite.destination);
                    }
                }
                if (_this.intervalHandle == undefined) {
                    _this.status({fill:"yellow",shape:"ring",text:"Waiting to fetch"});
                    _this.intervalHandle = setTimeout(function() {
                        var fetchClosure = function () {
                            _this.fetch(_this.url + _this.favouriteConfigs.join(","));
                        };
                        fetchClosure();
                        _this.intervalHandle = setInterval(fetchClosure, _this.interval * 1000);
                    }, 500);
                }
			}
        });
        this.fetch = function(url) {
            this.status({fill:"blue",shape:"ring",text:"Fetching data"});
            var msg = {};
            msg.url = url;
            msg.topic = "trafikanten-departures";
            var _this = this;
            request({url:url, json:true, timeout: Math.floor(this.interval * 1000 / 2)}, function(error, response, body) {
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
                    departures.sort(function(a, b) {
                        return a.time - b.time;
                    });
                    msg.payload = departures;
                    _this.status({fill:"green",shape:"dot",text:"Idle"});
                } else {
                    _this.status({fill:"red",shape:"dot",text:"Error: " + error.code});
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