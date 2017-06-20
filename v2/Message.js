// @flow
const NEWLINE = '\n';
const TAB = '\t';

class Message {

    _text : string;

    constructor(text: string) {
        this._text = text;
    }


    get text(): string {
        return this._text;
    }
}

class MessageDisplay {

    displayEffect : DisplayEffect;
    message : Message;
    display : Display;

    constructor(displayEffect, message, display) {
        this.displayEffect = displayEffect;
        this.message = message;
        this.display = display;
    }

    async play() {
        await this.display.play(this.message, this.displayEffect);
    }
}

interface Display {
    play(message: Message, displayEffect: DisplayEffect) : Promise<void>
}

class TextDisplay implements Display {

    //noinspection JSMethodCanBeStatic
    async play(message : Message, displayEffect : DisplayEffect) {
        displayEffect.play(message);
    }
}

function timeoutPromise(ms) : Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface DisplayEffect {
    play(message : Message): Promise<void>;
}

class TabbingDisplayEffect implements DisplayEffect {
    // Denne støtter bare ren tekst

    //noinspection JSMethodCanBeStatic
    async play(message : Message) : Promise<void> {
        let lines = message.text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            console.log(lines[i]);
        }
        await timeoutPromise(5000);
    }
}


let display = new TextDisplay();
let message = new Message(`Laks${TAB}er en${NEWLINE}fisk`);
let effect = new TabbingDisplayEffect();
display.play(message, effect);
