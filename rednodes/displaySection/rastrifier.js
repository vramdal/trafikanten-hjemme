var font = require("./font");
module.exports =  {
    rastrify: function(msg) {
        var text = msg.payload;
        if (text == null) {
            text = "";
        }
        var tabs = [];
        var bufferSize = findRequiredBufferSize(text);
        var arrayBuffer = new ArrayBuffer(bufferSize);
        var bufferView = new Uint8Array(arrayBuffer);
        var offset = 0;
        for (var c = 0; c < text.length; c++) {
            var ch = text[c];
            if (font[ch]) {
                bufferView.set(font[ch].bytes, offset);
                offset += font[ch].width;
            } else if (ch == '\t') {
                tabs.push(offset);
            } else if (font[ch.charCodeAt(0)]) {
                bufferView.set(font[ch.charCodeAt(0)].bytes, offset);
                offset += font[ch.charCodeAt(0)].width;
            } else {
                console.warn("Ukjent tegn: " + ch);
            }
            if (c < text.length - 1) {
                offset += 1;
            }
        }
        var bitmap = Array.prototype.slice.call(bufferView);
        msg.payload = bitmap;
        msg.topic = "bitmap";
        msg.tabs = tabs;
        return msg;
    }
};
function findRequiredBufferSize(line) {
	var bufferSize = 0;
	for (var c = 0; c < line.length; c++) {
		var ch = line[c];
		if (font[ch]) {
			bufferSize += font[ch].width;
		} else if (font[ch.charCodeAt(0)]) {
            bufferSize += font[ch.charCodeAt(0)].width;
        }
		if (c < line.length - 1) {
			bufferSize += 1;
		}
	}
	return bufferSize;
}
