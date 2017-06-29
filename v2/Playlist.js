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

    constructor(displayEventEmitter : DisplayEventEmitter) {
        this._displayEventEmitter = displayEventEmitter;
        this._playlistItemIdx = 0;
    }

    play(messages: Array<Message>) : Promise<void> {
        let promise : Promise<void> = Promise.resolve();
        messages.forEach(message => {
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
        let frameStart = 0; // TODO: Extract from message
        let frameWidth = 20; // TODO: Extract from message
        let renderedMessage : RenderedMessage = rastrify(message.text, frameWidth);
        let layout : Layout = [new Frame(frameStart, frameWidth)];
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