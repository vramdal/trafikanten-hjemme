import GpioPiDisplay from "./GPIOPiDisplay";


const buffer: ArrayBuffer = new ArrayBuffer(256);
for (let i = 0; i < 256; i++) {
 buffer[i] = i;
}


const display = new GpioPiDisplay();
// display.outputRaw(buffer);
