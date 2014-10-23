var RED = require("node-red");
module.exports = function(RED) {
    function sorter(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
            if (!msg.payload) {
                return;
            }
            if (!Array.isArray(msg.payload)) {
                msg.payload = [msg.payload];
            }
            var fieldName = config["field"];
            var asc = config["order"] == "ascending";
            msg.payload.sort(function(a, b) {
                var result = 0;
                if (a[fieldName] < b[fieldName]) {
                    result = 1;
                } else if (a[fieldName] > b[fieldName]) {
                    result = -1;
                }
                return result * (asc ? 1 : -1);

            });
            _this.send(msg);
        });

    }
    RED.nodes.registerType("sorter", sorter);
};