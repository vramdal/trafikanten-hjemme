var RED = require("node-red");
module.exports = function(RED) {
    function trafikantenProvider(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {
            node.send(msg);
        });
    }
    RED.nodes.registerType("departure-merger", trafikantenProvider);
};