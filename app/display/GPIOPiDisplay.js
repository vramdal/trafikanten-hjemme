// @flow
import type {DisplayInterface} from "./DisplayInterface";
const Display = require("./Display.js");

class GPIOPiDisplay extends Display implements DisplayInterface {

    ledDisplay : any;
    isOutputting : boolean;

    constructor() {
        super();
        this.isOutputting = false;
        this.ledDisplay = require("pi-led");
        console.log("this.ledDisplay = ", this.ledDisplay);
        this.ledDisplay.Init(true);
    }


    output() {
        if (this.ledDisplay) {
            try {
                if (this.isOutputting) {
                    console.warn("Outputting too fast");
                } else {
                    this.isOutputting = true;
                    // if (Array.isArray(this.buffer)) {
                    this.ledDisplay.WriteBytes(Array.from(this.buffer), 0);
                    // } else {
                    //     console.warn("Buffer is not an array of bytes, but " + typeof this.buffer);
                    // }
                    this.isOutputting = false;
                }
            } catch (e) {
                console.error(`Error playing playlist ${JSON.toString(this._playlist)}`, e);
                throw e;
            }
        }
    }

}
/*
function wiringPiDisplay(config) {
    RED.nodes.createNode(this, config);
    var _this = this;
    this.isOutputting = false;
    _this.status({});
    var empty = [];
    for (var i = 0; i < 256; i++) {
        empty[i] = 0;
    }
    var waitingForData = [124, 2, 12, 2, 124, 0, 6, 42, 42, 42, 30, 0, 18, 94, 2, 0, 32, 32, 124, 34, 34, 0, 18, 94, 2, 0, 62, 16, 32, 32, 30, 0, 24, 41, 41, 63, 0, 0, 0, 0, 0, 8, 62, 72, 72, 64, 0, 28, 34, 34, 34, 28, 0, 62, 16, 32, 32, 0, 0, 0, 0, 0, 12, 18, 18, 126, 0, 6, 42, 42, 42, 30, 0, 32, 32, 124, 34, 34, 0, 6, 42, 42, 42, 30];
    if (ledDisplay) {
        ledDisplay.ClearMatrix();
        ledDisplay.WriteBytes(waitingForData, 0);
        ledDisplay.WriteBytes(waitingForData, 128);
    }
    this.on("input", function(msg) {
        if (msg.topic == "bitmap") {
            if (isNaN(msg.start)) {
                msg.start = 0;
            }
            var start = msg.start;
            var end = msg.start + msg.payload.length;
            var bytesToWrite = msg.payload.slice(0, end - start);
            if (start + bytesToWrite.length > 256) {
                console.error("Attempting to write off-screen.", "start: ", start, "end: ", end, "bytes length: ", bytesToWrite.length);
                console.error("Full message: ", msg);
                _this.status({fill: "red", shape: "dot", text: "Attempting to write off-screen, check logs"});
                return;
            }
            if (ledDisplay) {
                try {
                    if (_this.isOutputting) {
                        console.warn("Outputting too fast");
                    } else {
                        _this.isOutputting = true;
                        ledDisplay.WriteBytes(bytesToWrite, start);
                        _this.isOutputting = false;
                    }
                } catch (e) {
                    console.error("Error displaying message '" + msg.msgString + "'. Topic: " + msg.topic + ", url: " + msg.url + ", start: " + start + ", bitmap length: " + bytesToWrite.length + ", end: " + end, e);
                    console.error("Full message: ", msg);
                    throw e;
                }
            }
            _this.send(msg);
        } else if (msg.topic == "init") {
            if (ledDisplay) {
                ledDisplay.Init();
            }
        } else {
            console.log("Not supported message topic");
            _this.send(msg);
        }
    });
}
*/

module.exports = GPIOPiDisplay;