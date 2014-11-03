var ledDisplay;
try {
	var Led = require('pi-led').PiLed;
	ledDisplay = new Led();
} catch (err) {
	console.warn("Could not initialize PiLed", err);
}
module.exports = function(RED) {
    function wiringPiDisplay(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
            if (msg.topic == "bitmap") {
				if (isNaN(msg.start)) {
					msg.start = 0;
				}
				var start = msg.start;
				var end = msg.start + msg.payload.length;
				var bytesToWrite = msg.payload.slice(0, end - start);
				if (ledDisplay) {
					ledDisplay.WriteBytes(bytesToWrite, start);
				}
                _this.send(msg);
            } else {
                console.log("Not supported message topic");
                _this.send(msg);
            }
        });
    }
    RED.nodes.registerType("wiringPiDisplay", wiringPiDisplay);
};