// @flow
import type {Bitmap} from "./BitmapWithControlCharacters";

function bitmapTo8Lines(bitmap : Bitmap) {
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
    let result : Array<string> = [];
    for (let l = 0; l < lines.length; l++) {
        let line = lines[l].join("");
        result.push(line);
        console.log(line);
    }
    return result.join("\n");
}

function printRuler() {
    let ruler = "";
    let i = 0;
    while (i < 135) {
        let str;
        str = i % 10 === 0 ? "|" + i + "" : " ";
        i += str.length;
        ruler += str;
    }
    console.log(ruler);
}

function numToPaddedHex(num : number) : string {
    "use strict";
    let h = (num).toString(16);
    return h.length % 2 ? '0' + h : h;
}

function getHexFingerprint(str : string) : string {
    const lines = str.split("\n");
    let width = lines[0].length;
    let result = new Array(width).fill(0);
    for (let x = 0; x < width; x++) {
        let byte = 0;
        let factor = 0x01;
        for (let y = 0; y < 8; y++) {
            let bit = lines[y][x] === "█" ? 1 : 0;
            byte = byte | (bit * factor);
            factor = factor * 2;
        }
        result[x] = byte;
    }
    return result.map(numToPaddedHex).join("");
}


module.exports = {
    bitmapTo8Lines, printRuler, numToPaddedHex, getHexFingerprint
};