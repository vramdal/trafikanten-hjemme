import Ticker from "../timing/Ticker";
import type {CountdownPromise} from "../timing/Ticker";
import type {AnnotatedBitmap} from "../bitmap/Bitmap";
import type {TextInFrame} from "../types/Message";
import Frame from "../bitmap/Frame";

import Message from "../types/Message";

import ConsoleUtils from "./ConsoleUtils";

const Rastrifier = require("./Rastrifier");
const timingFactor = require("../settings").timingFactor;


class MessageDisplay {

    _ticker: Ticker;
    _framesThatArePlaying: Array<Frame>;
    _stop: boolean;
    // _displayEventEmitter: DisplayEventEmitter;
    _message: Message;
    _prepared: boolean;

    constructor(message : Message, /*display : DisplayEventEmitter*/) {
        this._message = message;
        // this._displayEventEmitter = display;
        this._ticker = new Ticker(25, this.scrollFrames.bind(this), timingFactor);
        this._stop = false;
        this._prepared = false;
    }

    prepare() {
        let parts : Array<TextInFrame> = this._message.parts;
        parts.forEach(part => {
            let frame = part.frame;
            let bitmap : AnnotatedBitmap = Rastrifier.rastrify(part.text);
            frame.setBitmap(bitmap);
        });
        this._prepared = true;
    }

    play() : Promise<any> {
        this._framesThatArePlaying = this._message.layout.map(frame => frame);
        // this._displayEventEmitter.emit(EventTypeNames.EVENT_BITMAP_CLEAR);
        return this._ticker.countdown().then(() => {
            process.stdout.write("\n");
            Promise.resolve();
        }).catch(err => Promise.reject(err));
    }

    stop() {
        this._stop = true;
    }

    scrollFrames() : CountdownPromise {
        if (!this._prepared) {
            throw new Error("MessageDisplay has not been prepared yet.");
        }
        if (this._stop) {
            return Promise.resolve(0);
        }
        return new Promise((resolve, reject) => {
            let frames = this._framesThatArePlaying.slice();
            let promises = frames.map(frame => frame.tick());
            let findMax = (acc, currentValue) => Math.max(acc, currentValue);
            Promise.all(promises).then((results) => {
                if (results.length === 0) {
                    console.warn("Message has no frames - nothing to display", this._message);
                }
                this._framesThatArePlaying = frames.filter(frame => !frame.animationComplete);
                let animationRemaining = frames.map(frame => frame.animationRemaining).reduce(findMax, 0);
                ConsoleUtils.progressBar(1 - animationRemaining);
                // this._displayEventEmitter.emit(EventTypeNames.EVENT_BITMAP_UPDATED, frames);
                resolve(this._framesThatArePlaying.length);
            }).catch((err) => {
                return reject(err);
            });
        });
    }
}

export default MessageDisplay;
