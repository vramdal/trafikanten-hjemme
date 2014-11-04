var scrollerLib = require("./scroller");

module.exports = function(RED) {
    function displaySection(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
		var start = parseInt(config["start"], 10);
		var end = parseInt(config["end"], 10);
        var length = end - start;
        var mode = config["mode"];
        var scrollSpeed = parseInt(config["scrollSpeed"], 10);
        var scroller = new scrollerLib(this);
        var empty = [end - start];
        for (var i = 0; i < length; i++) {
            empty[i] = 0;
        }
        var intervalId = undefined;

        this.tabify = function(bytes, tabs) {
            // TODO: Support multiple tabs
            if (bytes.length >= length) {
                return bytes;
            }
            var tab = tabs[0];
            return Array.prototype.concat(bytes.slice(0, tab), empty.slice(0, length - bytes.length), bytes.slice(tab, bytes.length));
        };

		this.on("input", function(msg) {
            if (msg.topic == "bitmap") {
				msg.start = start;
				msg.end = end;
                if (mode == "tabify" && msg.tabs && msg.tabs.length > 0) {
                    msg.payload = _this.tabify(msg.payload, msg.tabs);
                }
                if (mode == "scroll-rtl") {
                    scroller.setMsg(msg);
                    if (intervalId == undefined) {
                        intervalId = setInterval(scroller.doScroll.bind(scroller), scrollSpeed);
                    }
                }
                if (msg.payload.length > length) {
                    msg.payload = msg.payload.slice(0, length);
                }
				while (msg.payload.length < end - start) {
					msg.payload.push(0);
				}
				_this.send(msg);
            } else {
                console.log("Unsupported message topic: ", msg.topic);
                _this.send(msg);
            }
        });
        this.on('close', function() {
            if (intervalId != undefined) {
                clearInterval(intervalId);
            }
        });


    }
    RED.nodes.registerType("displaySection", displaySection);
};
