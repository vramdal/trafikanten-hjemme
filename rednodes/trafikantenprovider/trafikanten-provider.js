var RED = require("node-red");
module.exports = function(RED) {
    function trafikantenProvider(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {
            msg.url = "http://reisapi.ruter.no/Favourites/GetFavourites?favouritesRequest=" + config["configurationString"];
            node.send(msg);
        });
    }
    RED.nodes.registerType("trafikanten-provider", trafikantenProvider);
};