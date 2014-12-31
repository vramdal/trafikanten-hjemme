var RED = require("node-red");
var parseString = require("xml2js").parseString;
var request = require("request");
module.exports = function(RED) {
    function yrProvider(config) {
        RED.nodes.createNode(this, config);
        var postcode = config["postcode"];
        var node = this;
        this.msg = undefined;
        this.url = "http://www.yr.no/sted/Norge/postnummer/"+postcode+"/varsel.xml";
        this.fetch = function() {
            request({
                url:     node.url,
                timeout: Math.floor(this.interval / 2),
                forever: true
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    parseString(body, function(err, result) {
                        var forecast = result.weatherdata.forecast[0];
                        var textTimes = forecast.text[0].location[0];
                        var idag = {title: textTimes.time[0].title, body: textTimes.time[0].body};
                        var imorgen = {title: textTimes.time[1].title, body: textTimes.time[1].body};
                        var tabularPeriods = [];
                        for (var i = 0; i < forecast.tabular[0].time.length; i++) {
                            var tabular = forecast.tabular[0].time[i];
                            tabularPeriods.push({
                                from: new Date(tabular.$.from),
                                to: new Date(tabular.$.to),
                                period: tabular.$.period,
                                precipitation: {
                                    max: parseFloat(tabular.precipitation[0].$.maxvalue),
                                    min: parseFloat(tabular.precipitation[0].$.minvalue),
                                    value: parseFloat(tabular.precipitation[0].$.value)
                                },
                                symbol: {
                                    name: tabular.symbol[0].$.name,
                                    number: tabular.symbol[0].$.number,
                                    numberEx: tabular.symbol[0].$.numberEx,
                                    "var": tabular.symbol[0].$.var
                                },
                                temperatureCelsius: parseFloat(tabular.temperature[0].$.value),
                                wind: {
                                    direction: {
                                        code: tabular.windDirection[0].$.code,
                                        deg: tabular.windDirection[0].$.deg,
                                        name: tabular.windDirection[0].$.name
                                    },
                                    speed: {
                                        mps: parseFloat(tabular.windSpeed[0].$.mps),
                                        name: tabular.windSpeed[0].$.name
                                    }
                                }
                            });
                        }
                        node.msg = tabularPeriods;
                        console.dir(tabularPeriods);
                        node.send({"payload": "Værvarsel fra yr.no, levert av NRK og Meteorologisk institutt"})
                    });
                } else {
                    error = error != undefined ? error : new Error();
                    error.url = node.url;
                    callback(null, error);
                }
            });
        };

        this.on("input", function(msg) {
            this.fetch();
        });

        setTimeout(node.fetch.bind(this), 1000);
        this.intervalId = setInterval(node.fetch.bind(this), 10*60*1000);
        this.on('close', function() {
            if (node.intervalId != undefined) {
                clearInterval(node.intervalId);
            }
        });
    }
    RED.nodes.registerType("yrProvider", yrProvider);
};