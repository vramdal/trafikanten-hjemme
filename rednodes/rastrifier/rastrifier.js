var RED = require("node-red");
var font = require("./font");
module.exports = function(RED) {
    function rastrifier(config) {
        RED.nodes.createNode(this, config);
        var _this = this;
        this.on("input", function(msg) {
            var line = msg.payload;
            var lineOut = [];
            var tabs = [];
            for (var c = 0; c < line.length; c++) {
                var ch = line[c];
                // TODO: Tabulators
                if (font[ch]) {
                    lineOut = lineOut.concat(font[ch].bytes);
                } else if (ch == '\t') {
                    tabs.push(lineOut.length);
                } else {
                    console.warn("Ukjent tegn: " + ch);
                }
                if (c < line.length - 1) {
                    lineOut.push(0);
                }
                //lineOut.push(font[ch].bytes);
            }
            // TODO: Supports only one tab per now
            if (tabs.length > 0) {
                var tab = tabs[0];
                var tabBytes = [];
                var tabSpace = 128 - lineOut.length;
                for (var t = 0; t < tabSpace; t++) {
                    tabBytes.push(0);
                }
                tabBytes.push(0); // One more for the actual '\t' character
                lineOut = lineOut.slice(0, tab).concat(tabBytes).concat(lineOut.slice(tab + 1));
            }
            msg.topic = "bitmap";
            msg.payload = lineOut;
            _this.send(msg);
        });
    }
    RED.nodes.registerType("rastrifier", rastrifier);
};