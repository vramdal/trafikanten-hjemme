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
                    if (msg.payload == undefined) {
                        msg.payload = [];
                    } else {
                        msg.payload = [msg.payload];
                    }
                } else {
                    _this.send(msg);
                    return;
                }
            }
            if (Array.isArray(msg.payload) && msg.payload.length == 0 && !forceArray) {
                msg.payload = null;
                _this.send(msg);
                return;
            }

            if (from <= msg.payload.length) {
                msg.payload = msg.payload.slice(from, isNaN(to) ? msg.payload.length : Math.min(to, msg.payload.length));
            }
            if (from == undefined && to < msg.payload.length) {
                msg.payload = msg.payload.slice(0, to);
            }
            if (from <= msg.payload.length && to < msg.payload.length) {
                msg.payload = msg.payload.slice(from, to);
            }
            if (msg.payload.length == 1 && !forceArray) {
                msg.payload = msg.payload[0];
            }
            _this.send(msg);
        });
    }
    RED.nodes.registerType("arrayslice", arrayslice);
};