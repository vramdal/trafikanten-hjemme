// @flow

const MessageDisplay = require("./MessageDisplay");
const Message = require("../types/Message.js");
const DisplayEventEmitter = require("../display/DisplayEventEmitter.js");

class PlaylistDisplay {

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
            let start = new Date();
            promise = promise.then(() => {
                    console.log("Playing message " + message.toString());
                    let preparedMessage = this.prepareMessage(message);
                    return preparedMessage.play();
                })
                .catch((err) => {throw err})
                .then(() => {
                    let end = new Date();
                    let seconds = (end.getTime() - start.getTime()) / 1000;
                    console.log("Done playing message", seconds, "seconds");
                }
            );
        });
        if (this._messages.length === 0) { // Empty playlist
            console.warn("Empty playlist");
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return promise; // A promise that be resolved when all messages have been played
    }

    //noinspection JSMethodCanBeStatic
    prepareMessage(message : Message) : MessageDisplay {
        let messageDisplay = new MessageDisplay(message, this._displayEventEmitter);
        messageDisplay.prepare();
        return messageDisplay;

    }

    get length() : number {
        return this._messages && this._messages.length || 0;
    }

    stop() {
        this._currentlyPlayingMessage && this._currentlyPlayingMessage.stop();
    }
}

module.exports = PlaylistDisplay;