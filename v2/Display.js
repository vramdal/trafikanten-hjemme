// @flow

const Playlist = require("./Playlist.js");
const Message = require("./Message.js");

const messages : Array<Message> = [new Message("Hei på deg!"), new Message("Hello, world!")];

class Display {

    _playlist: Playlist;


    constructor() {
        this._playlist = new Playlist();
    }

    set playlist(playlist : Playlist) {
        this._playlist = playlist;
    }

    play() {
        if (this._playlist) {
            this._playlist.play(messages).then(() => {
                this.play();
            }).catch(err => {
                console.error("Feil: ", err)
            });
        } else {
            setTimeout(this.play.bind(this), 1000);
        }
    }

    stop() {
        if (this._playlist) {
            this._playlist.stop();
        }
    }


}

module.exports = Display;