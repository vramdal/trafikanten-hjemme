var RED = require("node-red");
module.exports = function(RED) {
    function prioritize(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        var priority = parseInt(config["priority"], 10);
		var urgent = config["urgent"];
        this.on("input", function(msg) {
			msg.priority = priority;
			if (urgent) {
				msg.urgent = true;
			}
            _this.send(msg);
        });
    }
    RED.nodes.registerType("prioritize", prioritize);
};