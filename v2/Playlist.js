// @flow

const MessageDisplay = require("./MessageDisplay");
const Message = require("./Message.js");
const rastrify = require("./Rastrifier.js").rastrify; // TODO: Inject rastrifier
const Frame = require("./Frame.js");
const Display = require("./Display.js");
const DisplayEventEmitter = require("./DisplayEventEmitter.js");
import type {Layout} from "./Frame.js";
import type {RenderedMessage} from "./RenderedMessage";

class Playlist {

    _messages: Array<Message>;
    _playlistItemIdx: number ;
    _currentlyPlayingMessage : ?MessageDisplay;
    _displayEventEmitter: DisplayEventEmitter;

    constructor(displayEventEmitter : DisplayEventEmitter, messages : Array<Message>) {
        this._displayEventEmitter = displayEventEmitter;
        this._playlistItemIdx = 0;
        this._messages = messages.slice();
    }

    play() : Promise<void> {
        let promise : Promise<void> = Promise.resolve();
        this._messages.forEach(message => {
            promise = promise.then(() => {
                    console.log("Playing message " + message.toString());
                    let preparedMessage = this.prepareMessage(message);
                    return preparedMessage.play();
                })
                .catch((err) => {throw err})
                .then(() => {
                    console.log("Done playing message");
                }
            );
        });
        return promise; // A promise that be resolved when all messages have been played
    }

    //noinspection JSMethodCanBeStatic
    prepareMessage(message : Message) : MessageDisplay {
        let frame = message.layout[0]; // TODO: Support multiple frames. Move logic to MessageDisplay
        let frameStart = frame.x;
        let frameWidth = frame.width;
        let animation = frame._animation;
        let renderedMessage : RenderedMessage = rastrify(message.text, frameWidth);
        let layout : Layout = [new Frame(frameStart, frameWidth, animation)];
        for (let i = 0; i < layout.length; i++) {
            layout[i].setBitmap(renderedMessage[i]);
        }
        return new MessageDisplay(renderedMessage, layout, this._displayEventEmitter);

    }

    get length() : number {
        return this._messages && this._messages.length || 0;
    }

    stop() {
        this._currentlyPlayingMessage && this._currentlyPlayingMessage.stop();
    }
}

module.exports = Playlist;