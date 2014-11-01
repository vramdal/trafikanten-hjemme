var RED = require("pi-led");
var led = new Led();
module.exports = function(RED) {
    function wiringPiDisplay(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
//        var limit = config["limit"];
        this.on("input", function(msg) {
            if (msg.topic == "bitmap") {
                led.WriteBytes(msg.payload);
                _this.send(msg);
            } else {
                console.log("Not supported message topic");
                _this.send(msg);
            }
        });
    }
    RED.nodes.registerType("wiringPiDisplay", wiringPiDisplay);
};