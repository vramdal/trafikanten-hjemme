var RED = require("node-red");
var request = require("request");
var http = require("http");
var async = require("async");
module.exports = function(RED) {
    function trafikantenFetcher(config) {
        RED.nodes.createNode(this, config);
        http.globalAgent.maxSockets = 200;
        var _this = this;
        this.url = undefined;
        this.interval = parseInt(config["interval"], 10);
        this.intervalHandle = undefined;
        _this.status({fill:"yellow",shape:"dot",text:"Waiting for specs"});
        this.on('close', function() {
            if (_this.intervalHandle != undefined) {
                clearInterval(_this.intervalHandle);
            }
        });
        this.on("input", function(msgArr) {
            try {
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
                        _this.status({fill: "yellow", shape: "ring", text: "Waiting to fetch"});
                        _this.intervalHandle = setTimeout(function () {
                            var fetchClosure = function () {
                                // TODO: Merge favourites into one request
                                _this.status({fill:"blue",shape:"ring",text:"Fetching data"});
                                async.mapLimit(_this.favouriteConfigs, 1,  _this.fetch.bind(_this), function (error, departuresArrArr) {
                                    if (error) {
                                        console.error(error);
                                        return;
                                    }
                                    _this.status({fill:"green",shape:"dot",text:"Idle"});
                                    var departures = [];
                                    for (var i = 0; i < departuresArrArr.length; i++) {
                                        var departuresArr = departuresArrArr[i];
                                        if (departuresArr instanceof Error) {
                                            console.error(departuresArr);
                                            _this.status({fill: "red", shape: "dot", text: "Error " + departuresArr.code + ": " + departuresArr.url});
                                        } else if (departuresArr != null) {
                                            departures = departures.concat(departuresArr);
                                        }
                                    }
                                    departures.sort(function(a, b) {
                                        return a.time - b.time;
                                    });
                                    async.map(departures, function(departure, cb) {
                                        cb(null, _this.formatDeparture(departure));
                                    }, function(error, formatted) {
                                        var msg = {
                                            payload: formatted,
                                            topic: "trafikanten-departures"
                                        };
                                        _this.send(msg);
                                    });
                                });
                            };
                            fetchClosure();
                            _this.intervalHandle = setInterval(fetchClosure, _this.interval * 1000);
                        }, 1000);
                    }
                }
            } catch (e) {
                console.error("Configuration error", e);
            }
        });
        this.fetch = function(favourite, callback) {
            var msg = {};
            var url = "http://reisapi.ruter.no/Favourites/GetFavourites?favouritesRequest=" + encodeURIComponent(favourite);
            msg.url = url;
            msg.topic = "trafikanten-departures";
            var _this = this;
            request({url:url, json:true, timeout: Math.floor(this.interval * 1000 / 2), forever: true}, function(error, response, body) {
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
                    callback(null, departures);
                } else {
                    error.url = url;
                    callback(null, error);
                }
            });
        };
        this.formatDeparture = function(departureSpec) {
            return departureSpec.line + " " + departureSpec.destination + "\t" + this.formatTime(departureSpec.time);
        };
        this.formatTime = function(timestamp) {
            var departureTime = {
                seconds: timestamp / 1000,
                minutes: timestamp / 1000 / 60
            };
            var nowMs = new Date().getTime();
            var now = {
                seconds: nowMs / 1000,
                minutes: nowMs / 1000 / 60
            };
            if (departureTime.seconds - now.seconds < 45) {
                return "nå";
            } else if (departureTime.seconds - now.seconds < 60) {
                return "1 min";
            } else if (departureTime.minutes - now.minutes < 10) {
                return (Math.floor(departureTime.minutes - now.minutes)) + " min";
            } else {
                var d = new Date();
                d.setTime(timestamp);
                var hours = d.getHours();
                hours = (hours < 10 ? "0" : "") + hours;
                var minutes = d.getMinutes();
                minutes = (minutes < 10 ? "0" : "") + minutes;
                return hours + ":" + minutes;
            }

        };
    }

    RED.nodes.registerType("trafikanten-fetcher", trafikantenFetcher);
};