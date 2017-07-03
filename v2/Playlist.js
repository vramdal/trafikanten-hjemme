// @flow

const MessageDisplay = require("./MessageDisplay");
const Message = require("./Message.js");
const Frame = require("./Frame.js");
const Display = require("./display/Display.js");
const DisplayEventEmitter = require("./DisplayEventEmitter.js");

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

module.exports = Playlist;