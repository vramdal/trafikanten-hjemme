module.exports = function(RED) {
    function displaySection(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
		var start = parseInt(config["start"], 10);
		var end = parseInt(config["end"], 10);

		this.on("input", function(msg) {
            if (msg.topic == "bitmap") {
				msg.start = start;
				msg.end = end;
				while (msg.payload.length < end - start) {
					msg.payload.push(0);
				}
				_this.send(msg);
            } else {
                console.log("Unsupported message topic: ", msg.topic);
                _this.send(msg);
            }
        });
    }
    RED.nodes.registerType("displaySection", displaySection);
};