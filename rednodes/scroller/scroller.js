var RED = require("node-red");
module.exports = function(RED) {
    function scroller(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        var interval = config["interval"];
        this.scrollDistance = 128;
        this.bytes = [];
        var emptyScreen = [];
        for (var i = 0; i < 128; i++) {
            emptyScreen.push(0);
        }
        this.on("input", function(msg) {
            if (msg.topic == "interval") {
                _this.doScroll();
            } else {
                var payload = msg.payload;
                if (!Array.isArray(payload)) {
                    throw new Error("Non-array received", payload);
                }
                this.bytes = payload.slice(0);
            }
        });
        this.doScroll = function() {
            var visibleBytes = [];
            if (this.scrollDistance > 0) {
                visibleBytes = (emptyScreen.slice(0, this.scrollDistance).concat(this.bytes, emptyScreen)).slice(0, 128);
            } else if (this.scrollDistance == 0) {
                visibleBytes = this.bytes.concat(emptyScreen).slice(0, 128);
            } else if (this.scrollDistance < 0) {
                visibleBytes = (this.bytes.slice(this.scrollDistance * -1, this.bytes.length).concat(emptyScreen)).slice(0, 128);
            }


            var msg = {
                payload: visibleBytes,
                topic: "scrolled",
                scrollDistance: this.scrollDistance
            };
            _this.send(msg);
            this.scrollDistance -= 1;
            if (this.scrollDistance < Math.min(-128, this.bytes.length * -1)) {
                this.scrollDistance = 128;
            }

        }
    }

    RED.nodes.registerType("scroller", scroller);
};