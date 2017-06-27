// @flow
const Ticker = require("./Ticker.js");
const Frame = require("./Frame.js");
import type {CountdownPromise} from "./Ticker";
const bitmapTo8Lines = require("./BitmapUtil").bitmapTo8Lines;
import type {Layout} from "./Frame.js";
import type {RenderedMessage} from "./RenderedMessage.js";


class MessageDisplay {

    _ticker: Ticker;
    _renderedMessage: RenderedMessage;
    _framesThatArePlaying: Array<Frame>;
    _stop: boolean;
    _error: Error;

    constructor(renderedMessage : RenderedMessage, layout : Layout) {
        this._renderedMessage = renderedMessage;
        this._ticker = new Ticker(100, this.scrollFrames.bind(this));
        this._framesThatArePlaying = layout.map(frame => frame);
        this._stop = false;
    }

    play() : Promise<any> {
        return this._ticker.countdown().then(() => Promise.resolve()).catch(err => Promise.reject(err));
    }

    stop() {
        this._stop = true;
    }

    scrollFrames() : CountdownPromise {
        return new Promise((resolve, reject) => {
            let frames = this._framesThatArePlaying.slice();
            for (let i = 0; i < frames.length; i++) {
                bitmapTo8Lines(frames[i].bitmap);
            }
            let maxUnitsRemaining = 0;
            for (let i = 0; i < frames.length && !this._stop && !this._error; i++) {
                let frame = frames[i];
                frame.tick().then(unitsRemaining => {
                    if (unitsRemaining <= 0) {
                        let index = this._framesThatArePlaying.indexOf(frame);
                        this._framesThatArePlaying.splice(index, 1);
                    }
                    maxUnitsRemaining = Math.max(maxUnitsRemaining, unitsRemaining);
                }).catch(err => {
                    this._error = err;
                });
            }
            if (this._error) {
                return reject(this._error);
            } else if (this._stop) {
                return reject(maxUnitsRemaining);
            } else {
                return resolve(maxUnitsRemaining);
            }
        });
    }
}

module.exports = MessageDisplay;