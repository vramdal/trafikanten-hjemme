// @flow

let pixelLeading = {
    "left": (frameWidth: number, contentPixelLength: number) => 0,
    "center": (frameWidth: number, contentPixelLength: number) => Math.floor((contentPixelLength - frameWidth) / 2),
    "right": (frameWidth: number, contentPixelLength: number) => contentPixelLength - frameWidth
};



module.exports = pixelLeading;