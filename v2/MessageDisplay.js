// @flow
const Ticker = require("./Ticker.js");
const Frame = require("./Frame.js");
import type {CountdownPromise} from "./Ticker";
const DisplayEventEmitter = require("./DisplayEventEmitter.js");
const EventTypeNames = require("./SimpleTypes.js").EventTypeNames;
const ConsoleUtils = require("./ConsoleUtils.js");
const Message = require("./Message.js");
const Rastrifier = require("./Rastrifier.js");
import type {Layout} from "./Frame.js";
import type {RenderedMessage} from "./RenderedMessage.js";

class MessageDisplay {

    _ticker: Ticker;
    _renderedMessage: ?RenderedMessage;
    _framesThatArePlaying: Array<Frame>;
    _stop: boolean;
    _displayEventEmitter: DisplayEventEmitter;
    _message: Message;

    constructor(message : Message, display : DisplayEventEmitter) {
        this._message = message;
        this._displayEventEmitter = display;
        this._ticker = new Ticker(100, this.scrollFrames.bind(this));
        this._stop = false;
    }

    prepare() {
        // TODO: Split into frames and parse frame parameters here
        let renderedMessage : RenderedMessage = [];
        let layout : Layout = this._message.layout;
        for (let frame of layout) {
            let frameWidth = frame.width;
            let bitmap = Rastrifier.rastrify(this._message.text, frameWidth);
            frame.setBitmap(bitmap);
            renderedMessage.push(bitmap);
        }
        this._renderedMessage = renderedMessage;

    }

    play() : Promise<any> {
        this._framesThatArePlaying = this._message.layout.map(frame => frame);

        return this._ticker.countdown().then(() => {
            process.stdout.write("\n");
            Promise.resolve();
        }).catch(err => Promise.reject(err));
    }

    stop() {
        this._stop = true;
    }

    scrollFrames() : CountdownPromise {
        if (!this._renderedMessage === undefined) {
            throw new Error("MessageDisplay has not been prepared yet.");
        }
        if (this._stop) {
            return Promise.resolve(0);
        }
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