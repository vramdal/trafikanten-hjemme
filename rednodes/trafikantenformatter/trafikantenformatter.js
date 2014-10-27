var RED = require("node-red");
module.exports = function(RED) {
    function trafikantenformatter(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
            if (!msg.payload) {
                return;
            }
            if (!Array.isArray(msg.payload)) {
                msg.payload = [msg.payload];
            }
            var formatted = [];
            for (var i = 0; i < msg.payload.length; i++) {
                var departure = msg.payload[i];
                formatted.push(departure.line + " " + departure.destination + "\t" + _this.formatTime(departure.time));
            }
            msg.payload = formatted;
            msg.topic = "formatted-departures";
            _this.send(msg);
        });
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
        }
    }
    RED.nodes.registerType("trafikantenformatter", trafikantenformatter);
};