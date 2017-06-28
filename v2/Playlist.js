// @flow

const MessageDisplay = require("./MessageDisplay");
const Message = require("./Message.js");
const rastrify = require("./Rastrifier.js").rastrify; // TODO: Inject rastrifier
const Frame = require("./Frame.js");
import type {Layout} from "./Frame.js";
import type {RenderedMessage} from "./RenderedMessage";

class Playlist {

    _messages: Array<Message>;
    _playlistItemIdx: number ;
    _currentlyPlayingMessage : ?MessageDisplay;

    constructor() {
        this._playlistItemIdx = 0;
    }

    play(messages: Array<Message>) : Promise<void> {
        let promise : Promise<void> = Promise.resolve();
        messages.forEach(message => {
            promise = promise.then(() => {
                    console.log("Playing message " + message.toString());
                    let preparedMessage = this.prepareMessage(message);
                    return preparedMessage.play()
                })
                .catch((err) => {throw err})
                .then(() => {console.log("Done playing message")});
        });
        return promise; // A promise that be resolved when all messages have been played
    }

    //noinspection JSMethodCanBeStatic
    prepareMessage(message : Message) : MessageDisplay {
        let renderedMessage : RenderedMessage = rastrify(message.text);
        let layout : Layout = [new Frame(0, 10)]; // TODO: Extract from message
        for (let i = 0; i < layout.length; i++) {
            layout[i].setBitmap(renderedMessage[i]);
        }
        return new MessageDisplay(renderedMessage, layout);

    }

    get length() : number {
        return this._messages && this._messages.length || 0;
    }

    stop() {
        this._currentlyPlayingMessage && this._currentlyPlayingMessage.stop();
    }
}

module.exports = Playlist;