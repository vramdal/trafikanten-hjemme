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
        this.isOutputting = false;
        var empty = [];
        for (var i = 0; i < 256; i++) {
            empty[i] = 0;
        }
        var waitingForData = [124, 2, 12, 2, 124, 0, 6, 42, 42, 42, 30, 0, 18, 94, 2, 0, 32, 32, 124, 34, 34, 0, 18, 94, 2, 0, 62, 16, 32, 32, 30, 0, 24, 41, 41, 63, 0, 0, 0, 0, 0, 8, 62, 72, 72, 64, 0, 28, 34, 34, 34, 28, 0, 62, 16, 32, 32, 0, 0, 0, 0, 0, 12, 18, 18, 126, 0, 6, 42, 42, 42, 30, 0, 32, 32, 124, 34, 34, 0, 6, 42, 42, 42, 30];
        ledDisplay.ClearMatrix();
        ledDisplay.WriteBytes(waitingForData, 0);
        ledDisplay.WriteBytes(waitingForData, 128);
        this.on("input", function(msg) {
            if (msg.topic == "bitmap") {
				if (isNaN(msg.start)) {
					msg.start = 0;
				}
				var start = msg.start;
				var end = msg.start + msg.payload.length;
				var bytesToWrite = msg.payload.slice(0, end - start);
                if (start + bytesToWrite.length > 256) {
                    console.error("Attempting to write off-screen.", "start: ", start, "end: ", end, "bytes length: ", bytesToWrite.length);
                    console.error("Full message: ", msg);
                    _this.status({fill:"red",shape:"dot",text:"Attempting to write off-screen, check logs"});
                    return;
                }
				if (ledDisplay) {
                    try {
                        if (_this.isOutputting) {
                            console.warn("Outputting too fast");
                        } else {
                            _this.isOutputting = true;
                            ledDisplay.WriteBytes(bytesToWrite, start);
                            _this.isOutputting = false;
                        }
                    } catch (e) {
                        console.error("Error displaying message '" + msg.msgString + "'. Topic: " + msg.topic + ", url: " + msg.url + ", start: " + start + ", bitmap length: " + bytesToWrite.length + ", end: " + end, e);
                        console.error("Full message: ", msg);
                        throw e;
                    }
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