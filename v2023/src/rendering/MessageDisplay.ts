import type { CountdownPromise } from "../timing/Ticker";
import Ticker from "../timing/Ticker";
import type { AnnotatedBitmap } from "../bitmap/Bitmap";
import type { TextInFrame } from "../types/Message";
import Message from "../types/Message";
import Frame from "../bitmap/Frame";

import ConsoleUtils from "./ConsoleUtils";
import Display from "../display/Display";

import * as Rastrifier from "./Rastrifier";

const timingFactor = 1;

class MessageDisplay {

  _ticker: Ticker;
  _framesThatArePlaying: Array<Frame>;
  _stop: boolean;
  _display: Display;
  _message: Message;
  _prepared: boolean;
  _estimatedDuration: number;

  constructor(message: Message, display: Display) {
    this._message = message;
    this._display = display;
    this._ticker = new Ticker(1, this.scrollFrames.bind(this), timingFactor);
    this._stop = false;
    this._prepared = false;
  }

  prepare() {
    let parts: Array<TextInFrame> = this._message.parts;
    parts.forEach(part => {
      let frame = part.frame;
      let bitmap: AnnotatedBitmap = Rastrifier.rastrify(part.text);
      frame.setBitmap(bitmap);
    });
    this._prepared = true;
  }

  play(): Promise<any> {
    this._framesThatArePlaying = this._message.layout.map(frame => frame);
    this._estimatedDuration = this._framesThatArePlaying.map(frame => frame.animationRemaining).reduce(this.findMax, 0);

    this._display.clear();
    return this._ticker.countdown().then(() => {
      process.stdout.write("\n");
      Promise.resolve();
    }).catch(err => Promise.reject(err));
  }

  stop() {
    this._stop = true;
  }

  private findMax(acc, currentValue) {
    return Math.max(acc, currentValue)
  };


  scrollFrames(): CountdownPromise {
    if (!this._prepared) {
      throw new Error("MessageDisplay has not been prepared yet.");
    }
    if (this._stop) {
      return Promise.resolve(0);
    }
    return new Promise((resolve, reject) => {
      let frames = this._framesThatArePlaying.slice();
      let promises = frames.map(frame => frame.tick());
      Promise.all(promises).then((results) => {
        if (results.length === 0) {
          console.warn("Message has no frames - nothing to display", this._message);
        }
        this._framesThatArePlaying = frames.filter(frame => !frame.animationComplete);
        let animationRemaining = frames.map(frame => frame.animationRemaining).reduce(this.findMax, 0);
        ConsoleUtils.progressBar(this._estimatedDuration - animationRemaining, this._estimatedDuration);
        this._display.onBitmapUpdated(frames);
        resolve(this._framesThatArePlaying.length);
      }).catch((err) => {
        return reject(err);
      });
    });
  }
}

export default MessageDisplay;
