var RED = require("node-red");
module.exports = function(RED) {
    function buffer(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.buffer = [];

        this.setupInterval = function() {
            _this.resetInterval();
            _this.intervalRef = setInterval(function() {
                _this.sendBuffer();
            }, config["interval"]);
        };

        this.resetInterval = function() {
            if (_this.intervalRef) {
                clearInterval(_this.intervalRef);
            }
        };

        this.on("input", function(msg) {
            _this.setupInterval();
            _this.buffer.push(msg);
            _this.status({fill:"green",shape:"dot",text:"Buffer: " + _this.buffer.length});

        });
        this.sendBuffer = function() {
            if (this.buffer.length == 0) {
                return;
            }
            _this.status({fill:"yellow",shape:"dot",text:"Sending buffer"});
            var toSend = this.buffer.slice(0);
            var msg = {
                payload: toSend,
                topic: "buffered-messages"
            };
            this.send(msg);
            this.buffer = this.buffer.slice(toSend.length);
            _this.status({fill:"green",shape:"ring",text:"Buffer empty"});
        }

    }
    RED.nodes.registerType("buffer", buffer);
};