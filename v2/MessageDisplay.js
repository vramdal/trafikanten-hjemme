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
            let findMax = (acc, currentValue) => Math.max(acc, currentValue);
            //let maxScrollWidth = frames.map(frame => frame.scrollWidth).reduce(findMax, 0);
            let promises = frames.map(frame => frame.tick());
            Promise.all(promises).then(() => {
                this._framesThatArePlaying = frames.filter(frame => frame.remainingScrollWidth > 0);
                let maxRemainingScrollWidth = frames.map(frame => frame.remainingScrollWidth).reduce(findMax, 0);
                let dots = new Array(Math.abs(frames[0]._scrollOffset)).fill(".").join("");
                process.stdout.write("Progress: " + dots + "\r");
                resolve(maxRemainingScrollWidth);
            }).catch((err) => {
                return reject(err);
            });
        });
    }
}

module.exports = MessageDisplay;