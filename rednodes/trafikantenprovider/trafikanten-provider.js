var RED = require("node-red");
module.exports = function(RED) {
    function trafikantenProvider(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        setTimeout(function() {
            for (var i = 0; i < config["configs"].length; i++) {
                node.send({
                    topic: "trafikanten-favourite-config",
                    payload: config["configs"][i]
                });
            }
        }, 500);
/*        this.on("input", function(msg) {
            msg.topic = "trafikanten-favourite-configs";
            msg.payload = config["configs"];
            node.send(msg);
        });
        */
    }
    RED.nodes.registerType("trafikanten-provider", trafikantenProvider);
};