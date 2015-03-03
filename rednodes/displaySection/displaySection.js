var scrollerLib = require("./scroller");
var rastrifier = require("./rastrifier");
var events = require("../../modules/redevents");

module.exports = function(RED) {
    function displaySection(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
		var start = parseInt(config["start"], 10);
		var end = parseInt(config["end"], 10);
        var length = end - start;
        var mode = config["mode"];
        var scrollSpeed = parseInt(config["scrollSpeed"], 10);
        var scroller = new scrollerLib(this, length);
        var empty = [end - start];
        for (var i = 0; i < length; i++) {
            empty[i] = 0;
        }
        var intervalId = undefined;

        this.emitMessageDisplayCompleteEvent = function(msg) {
            events.emit("messageDisplayComplete", msg["_messageUuid"], this);
        };

        this.tabify = function(bytes, tabs) {
            // TODO: Support multiple tabs
            if (bytes.length >= length) {
                return bytes;
            }
            var tab = tabs[0];
            return Array.prototype.concat(bytes.slice(0, tab), empty.slice(0, length - bytes.length), bytes.slice(tab, bytes.length));
        };

        this.reInit = function() {
            var msg = {
                "topic": "init",
                "payload": undefined
            };
            this.send(msg);
        };

		this.on("input", function(msg) {
            if (Array.isArray(msg.payload)) {
                console.warn("Can not pass array to displaySection. Message: ", msg);
                return;
            }
            if (msg.topic != "bitmap") {
                msg = rastrifier.rastrify(msg);
            }
            msg.start = start;
            msg.end = end;
            if (mode == "tabify" && msg.tabs && msg.tabs.length > 0) {
                msg.payload = _this.tabify(msg.payload, msg.tabs);
            }
            if (mode == "tabify") {
                setTimeout(function() {
                    _this.emitMessageDisplayCompleteEvent(msg);
                }, msg.ttl != undefined ? msg.ttl : 1000);
            }
            if (mode == "scroll-rtl") {
                scroller.setMsg(msg);
                if (intervalId == undefined) {
                    intervalId = setInterval(scroller.doScroll.bind(scroller), scrollSpeed);
                }
                return;
            }
            if (msg.payload.length > length) {
                msg.payload = msg.payload.slice(0, length);
            }
            while (msg.payload.length < end - start) {
                msg.payload.push(0);
            }
            _this.send(msg);
        });
        this.on('close', function() {
            if (intervalId != undefined) {
                clearInterval(intervalId);
            }
        });


    }
    RED.nodes.registerType("displaySection", displaySection);
};

