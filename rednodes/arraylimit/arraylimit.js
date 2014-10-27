var RED = require("node-red");
module.exports = function(RED) {
    function arraylimit(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        var limit = config["limit"];
        this.on("input", function(msg) {
            if (!Array.isArray(msg.payload)) {
                _this.send(msg);
            } else if (msg.payload.length <= limit) {
                _this.send(msg);
            } else {
                msg.payload = msg.payload.slice(0, limit);
                _this.send(msg);
            }
        });
    }
    RED.nodes.registerType("arraylimit", arraylimit);
};