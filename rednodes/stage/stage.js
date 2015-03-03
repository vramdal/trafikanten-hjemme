var RED = require("node-red");
module.exports = function(RED) {
    function stage(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
            if (Array.isArray(msg.payload)) {
                msg.payload = msg.payload.join("  -  ").replace(/\t/g, ' ');
            }
            _this.send(msg);
        });
    }
    RED.nodes.registerType("stage", stage);
};