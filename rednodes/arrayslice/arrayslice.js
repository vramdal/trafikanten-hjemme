var RED = require("node-red");
module.exports = function(RED) {
    function arrayslice(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        var from = config["from"];
        var to = config["to"] != undefined ? parseInt(config["to"]) : undefined;
        var forceArray = config["forceArray"];
        this.on("input", function(msg) {
            if (!Array.isArray(msg.payload)) {
                if (forceArray) {
                    msg.payload = [msg.payload];
                }
            } else {
                if (from <= msg.payload.length) {
                    msg.payload = msg.payload.slice(from, isNaN(to) ? msg.payload.length : Math.min(to, msg.payload.length));
                }
                if (msg.payload.length == 1 && !forceArray) {
                    msg.payload = msg.payload[0];
                }
            }
            _this.send(msg);
        });
    }
    RED.nodes.registerType("arrayslice", arrayslice);
};