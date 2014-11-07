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
                        node.msg = result;
                        console.dir(result);
                        node.send({"payload": "Værvarsel fra yr.no, levert av NRK og Meteorologisk institutt"})
                    });
                } else {
                    error = error != undefined ? error : new Error();
                    error.url = url;
                    callback(null, error);
                }
            });
        };

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