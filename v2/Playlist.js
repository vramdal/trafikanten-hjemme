// @flow

const MessageDisplay = require("./MessageDisplay");
import type {CountdownPromise} from "./Ticker";
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

    play(messages: Array<Message>) : CountdownPromise {
        this._messages = messages;
        let message = this._messages[this._playlistItemIdx];
        this._currentlyPlayingMessage = this.prepareMessage(message);
        return this._currentlyPlayingMessage.play().then(() => {
            this._playlistItemIdx += 1;
            return Promise.resolve(this._messages.length - this._playlistItemIdx);
        }).catch(err => {
            return Promise.reject(err)
        });
    }

    //noinspection JSMethodCanBeStatic
    prepareMessage(message : Message) : MessageDisplay {
        let renderedMessage : RenderedMessage = rastrify(message.text);
        let layout : Layout = [new Frame(0, 128)]; // TODO: Extract from message
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