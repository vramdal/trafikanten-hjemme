var RED = require("node-red");
module.exports = function(RED) {
    function scroller(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        var interval = config["interval"];
        this.scrollDistance = 0;
        this.bytes = undefined;
		this.msgBytes = [];
        this.msgString = undefined;
		this.queuedMessagePriority = 10;
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
				if (!msg.priority) {
					msg.priority = 10;
				}
				if (msg.priority > this.queuedMessagePriority) {
					return;
				} else if (msg.urgent) {
					this.queuedMessagePriority = 0;
					this.msgBytes = payload.slice(0);
					this.bytes = emptyScreen.concat(this.msgBytes, emptyScreen);
					this.scrollDistance = 0;
				} else {
					this.queuedMessagePriority = msg.priority;
					this.msgBytes = payload.slice(0);
				}
                this.msgString = msg.msgString;
            }
        });
        this.doScroll = function() {
			if (this.bytes == undefined) {
				this.bytes = emptyScreen.concat(this.msgBytes, emptyScreen);
			}
            var visibleBytes = [];
            if (this.scrollDistance > 0) {
                visibleBytes = this.bytes.slice(this.scrollDistance, this.scrollDistance + 128);
            } else if (this.scrollDistance == 0) {
                visibleBytes = this.bytes.slice(this.scrollDistance, this.scrollDistance + 128);
            } else if (this.scrollDistance < 0) {
                visibleBytes = this.bytes.slice();
            }


            var msg = {
                payload: visibleBytes,
                topic: "bitmap",
                scrollDistance: this.scrollDistance,
                msgString: this.msgString
            };
            _this.send(msg);
            this.scrollDistance += 1;
            if (this.scrollDistance > this.bytes.length - 128) {
                this.scrollDistance = 0;
				this.bytes = emptyScreen.concat(this.msgBytes, emptyScreen);
				this.queuedMessagePriority = 10;
			}

        }
    }

    RED.nodes.registerType("scroller", scroller);
};