const GpioPiDisplay = require("./GPIOPiDisplay.js");

let arr = [];
for (let i = 0; i < 256; i++) {
 arr.push(i);
}

const buffer = new ArrayBuffer(arr);

const display = new GpioPiDisplay();
display.outputRaw(buffer);