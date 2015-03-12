var RED = require("node-red");
module.exports = function(RED) {
    function layoutResolver(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
            var layoutId;
            if (msg._layoutId != undefined) {
                layoutId = msg._layoutId;
            } else {
                switch (msg.topic) {
                    case "tweets": layoutId = "twitter"; break;
                    case "trafikanten-departures" : layoutId = "metro"; break;
                    default: layoutId = "default";
                }
            }
        });
    }
    RED.nodes.registerType("layoutResolver", layoutResolver);
};