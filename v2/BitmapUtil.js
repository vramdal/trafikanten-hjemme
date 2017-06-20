// @flow
import type {Bitmap} from "./BitmapWithControlCharacters";

function logBitmap(bitmap : Bitmap) {
    let lines : Array<Array<string>> = [[], [], [], [], [], [], [], []];
    for (let x = 0; x < bitmap.length; x++) {
        const byte = bitmap[x];
        let mask = 0x80;
        let y = 0;
        while (y < 8) {
            let bit = byte & mask;
            lines[y][x] = (bit ? "█" : "·");
            y = y + 1;
            mask = mask / 2;
        }
    }
    for (let l = 0; l < lines.length; l++) {
        console.log(lines[l].join(""));
    }
}

module.exports = {
    logBitmap
};