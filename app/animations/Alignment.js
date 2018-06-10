// @flow

let pixelLeading = {
    "left": (frameWidth: number, contentPixelLength: number) => 0,
    "center": (frameWidth: number, contentPixelLength: number) => Math.floor((frameWidth - contentPixelLength) / 2),
    "right": (frameWidth: number, contentPixelLength: number) => frameWidth - contentPixelLength
};



module.exports = pixelLeading;