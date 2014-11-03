var RED = require("node-red");
var font = require("./font");
module.exports = function(RED) {
    function rastrifier(config) {
        RED.nodes.createNode(this, config);
        var _this = this;

		function findRequiredBufferSize(line) {
			var bufferSize = 0;
			for (var c = 0; c < line.length; c++) {
				var ch = line[c];
				if (font[ch]) {
					bufferSize += font[ch].width;
				}
				if (c < line.length - 1) {
					bufferSize += 1;
				}
			}
			if (bufferSize < 128) {
				bufferSize = 128;
			}
			return bufferSize;
		}

		this.on("input", function(msg) {
            var line = msg.payload;
            var tabs = [];
			var bufferSize = findRequiredBufferSize(line);
			var arrayBuffer = new ArrayBuffer(bufferSize);
			var bufferView = new Uint8Array(arrayBuffer);
			var offset = 0;
            for (var c = 0; c < line.length; c++) {
                var ch = line[c];
                if (font[ch]) {
					bufferView.set(font[ch].bytes, offset);
					offset += font[ch].width;
                } else if (ch == '\t') {
                    tabs.push(offset);
                } else {
                    console.warn("Ukjent tegn: " + ch);
                }
                if (c < line.length - 1) {
					offset += 1;
                }
                //lineOut.push(font[ch].bytes);
            }
            // TODO: Supports only one tab per now
/*
            if (tabs.length > 0) {
                var tabPos = tabs[0];
                var tabBytes = [];
                var tabSpace = 128 - offset;
//				bufferView.copyWithin(tabPos + tabSpace, tabPos, 128 - tabPos);
				bufferView.move(tabPos, 128 - tabPos, tabPos + tabSpace);
				bufferView.set(new ArrayBuffer(tabSpace), tabPos);
                for (var t = 0; t < tabSpace; t++) {
                    tabBytes.push(0);
                }
                tabBytes.push(0); // One more for the actual '\t' character
                lineOut = lineOut.slice(0, tabPos).concat(tabBytes).concat(lineOut.slice(tabPos + 1));
            }
*/
            msg.topic = "bitmap";
			msg.payload = Array.prototype.slice.call(bufferView);
            _this.send(msg);
        });
    }
    RED.nodes.registerType("rastrifier", rastrifier);
};