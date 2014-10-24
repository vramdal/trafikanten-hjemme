var RED = require("node-red");
module.exports = function(RED) {
    function xerox(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
			var numberOfCopies = config["copies"] || _this.wires[0].length;
			var copies = [];
			for (var i = 0; i < numberOfCopies; i++) {
				copies.push(msg);
			}
			_this.send(copies);

        });
    }
    RED.nodes.registerType("xerox", xerox);
};