var RED = require("node-red");
var request = require("request");
var http = require("http");
var async = require("async");
module.exports = function(RED) {
    function trafikantenProvider(config) {
        RED.nodes.createNode(this, config);
        var specs = config["configs"];
        var _this = this;

        this.on("input", function(msg) {
            this.fetch(function(err, departures) {
                _this.formatDepartures(departures, function(err, str) {
                    if (err) {
                        console.error(err);
                    } else {
                        var output = {
                            topic: "trafikanten-departures",
                            payload: str
                        };
                        _this.send(output);
                    }
                });
            });
        });

        this.fetch = function(cb) {
            var stations = [];
            specs.forEach(function(spec) {
                if (stations.indexOf(spec.stationId) == -1) {
                    stations.push(spec.stationId);
                }
            });
            var numErrors = 0;
            _this.status({fill: "blue", shape: "ring", text: "Fetching data (" + stations.length + " requests)"});
            async.mapLimit(stations, 1, _this.stationRequest.bind(_this), function (error, departuresArrArr) {
                if (error) {
                    console.error(error);
                    return;
                }
                _this.status({fill: "green", shape: "dot", text: "Idle ("  + stations.length + " requests)"});
                var departures = [];
                for (var i = 0; i < departuresArrArr.length; i++) {
                    var departuresArr = departuresArrArr[i];
                    if (departuresArr instanceof Error) {
                        numErrors++;
                        console.error(departuresArr);
                        _this.status({
                            fill:  "red",
                            shape: "dot",
                            text:  "Error (" + numErrors + ") "  + departuresArr.code + ": " + departuresArr.url
                        });
                    } else if (departuresArr != null) {
                        departures = departures.concat(departuresArr);
                    }
                }
                async.filter(departures, function(departure, callback) {
                    var found = false;
                    for (var i = 0; i < specs.length; i++) {
                        var spec = specs[i];
                        if (spec.line == departure.line && spec.directionRef == departure.directionRef) {
                            found = true;
                            break;
                        }
                    }
                    callback(found);
                }, function(filteredDepartures) {
                    filteredDepartures.sort(function (a, b) {
                        return a.time - b.time;
                    });
                    _this.departureCache = filteredDepartures;
                    cb(null, filteredDepartures);

                });
            });
        };

        this.stationRequest = function(stationId, callback) {
            var msg = {};
            var url = "http://reisapi.ruter.no/stopvisit/getdepartures/" + stationId;
            msg.url = url;
            msg.topic = "trafikanten-departures";
            var _this = this;
            request({url:url, json:true, timeout: Math.floor(this.interval / 2), forever: true}, function(error, response, monitoredStopVisits) {
                if (!error  && response.statusCode == 200) {
                    var departures = [];
                    for (var i = 0; i < monitoredStopVisits.length; i++) {
                        var monitoredStopVisit = monitoredStopVisits[i];
                        var trafikantenJourney = monitoredStopVisit["MonitoredVehicleJourney"];
                        var departure = {
                            "line": trafikantenJourney["LineRef"],
                            "destination": trafikantenJourney["MonitoredCall"]["DestinationDisplay"],
                            "directionRef": trafikantenJourney["DirectionRef"],
                            "dateStr": trafikantenJourney["MonitoredCall"]["ExpectedDepartureTime"],
                            "time": Date.parse(trafikantenJourney["MonitoredCall"]["ExpectedDepartureTime"])
                        };
                        departures.push(departure);
                    }
                    callback(null, departures);
                } else {
                    error = error != undefined ? error : new Error();
                    error.url = url;
                    callback(null, error);
                }
            });
        };
        this.formatDepartures = function(departures, cb) {
            async.map(departures, this.formatDeparture, function(err, results) {
                cb(err, results.join("\n"));
            });
        };
        this.formatDeparture = function(departureSpec, cb) {
            var formatted = departureSpec.line + " " + departureSpec.destination + "\t" + _this.formatTime(departureSpec.time);
            if (cb) {
                cb(null, formatted);
            } else {
                return formatted;
            }
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
    RED.nodes.registerType("trafikanten-provider", trafikantenProvider);

};