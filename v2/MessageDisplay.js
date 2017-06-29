// @flow
const Ticker = require("./Ticker.js");
const Frame = require("./Frame.js");
import type {CountdownPromise} from "./Ticker";
const DisplayEventEmitter = require("./DisplayEventEmitter.js");
const EventTypeNames = require("./SimpleTypes.js").EventTypeNames;
const ConsoleUtils = require("./ConsoleUtils.js");
import type {Layout} from "./Frame.js";
import type {RenderedMessage} from "./RenderedMessage.js";

class MessageDisplay {

    _ticker: Ticker;
    _renderedMessage: RenderedMessage;
    _framesThatArePlaying: Array<Frame>;
    _stop: boolean;
    _displayEventEmitter: DisplayEventEmitter;

    constructor(renderedMessage : RenderedMessage, layout : Layout, display : DisplayEventEmitter) {
        this._renderedMessage = renderedMessage;
        this._displayEventEmitter = display;
        this._ticker = new Ticker(100, this.scrollFrames.bind(this));
        this._framesThatArePlaying = layout.map(frame => frame);
        this._stop = false;
    }

    play() : Promise<any> {
        return this._ticker.countdown().then(() => {
            process.stdout.write("\n");
            Promise.resolve();
        }).catch(err => Promise.reject(err));
    }

    stop() {
        this._stop = true;
    }

    scrollFrames() : CountdownPromise {
        return new Promise((resolve, reject) => {
            let frames = this._framesThatArePlaying.slice();
            let promises = frames.map(frame => frame.tick());
            let findMax = (acc, currentValue) => Math.max(acc, currentValue);
            Promise.all(promises).then(() => {
                this._framesThatArePlaying = frames.filter(frame => !frame.animationComplete);
                let animationRemaining = frames.map(frame => frame.animationRemaining).reduce(findMax);
                ConsoleUtils.progressBar(1 - animationRemaining);
                this._displayEventEmitter.emit(EventTypeNames.EVENT_BITMAP_UPDATED, frames);
                resolve(this._framesThatArePlaying.length);
            }).catch((err) => {
                return reject(err);
            });
        });
    }
}

module.exports = MessageDisplay;