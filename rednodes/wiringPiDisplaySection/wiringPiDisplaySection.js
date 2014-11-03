var Led = require('pi-led').PiLed;
var ledDisplay = new Led();
module.exports = function(RED) {
    function wiringPiDisplaySection(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        var start = parseInt(config["start"]);
        var end = parseInt(config["end"]);
        this.on("input", function(msg) {
            if (msg.topic == "bitmap") {
                ledDisplay.WriteBytes(msg.payload.slice(0, end - start), start);
                _this.send(msg);
            } else {
                console.log("Not supported message topic");
                _this.send(msg);
            }
        });
    }
    RED.nodes.registerType("wiringPiDisplaySection", wiringPiDisplaySection);
};