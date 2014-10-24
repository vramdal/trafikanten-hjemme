var RED = require("node-red");
var font = require("./font");
module.exports = function(RED) {
    function rastrifier(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
			var lines = msg.payload;
			if (!Array.isArray(lines)) {
				lines = [lines];
			}
			var payloadOut = [];
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];
				var lineOut = [];
				// TODO: Transpose array
				for (var c = 0; c < line.length; c++) {
					var ch = line[c];
					if (font[ch]) {
						lineOut.push(font[ch].bytes);
					}
				}
				payloadOut.push(lineOut);
			}
			msg.payload = payloadOut;
			_this.send(msg);
        });
    }
    RED.nodes.registerType("rastrifier", rastrifier);
};