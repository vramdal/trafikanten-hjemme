// @flow

import type {Bitmap} from "../Bitmap";
import type {CharacterProcessor} from "./CharacterProcessor";

const AlignRightRenderModifier = require("./AlignRightRenderModifier.js");
const AlignCenterRenderModifier = require("./AlignCenterRenderModifier.js");
import type {Char} from "../SimpleTypes";
import type {RenderControlMap, RenderModifier} from "./RenderModifier";

type RenderModifierFactory = (parameters : ?string) => RenderModifier;


const renderModifiers : {[Char] : RenderModifierFactory} = {
    "\x01": () => new AlignRightRenderModifier(),
    "\x02": () => new AlignCenterRenderModifier()
};

type ControlCharacterAtPosition = {position: number, character: Char, parameters: string};
type ControlCharacterMap = Array<ControlCharacterAtPosition>;


class ControlCharacterProcessor implements CharacterProcessor {

    controlCharacterMap : ControlCharacterMap;
    renderControlsAtPositions: RenderControlMap;

    constructor() {
        this.controlCharacterMap = [];
        this.renderControlsAtPositions = [];
    }

    /**
     * Returns the number of characters that should be parsed as a control character sequence,
     * or <code>falsey</code> if {@link ch} is not a control character
     * @param ch
     * @returns {*|number}
     */
    static _isControlSequenceStart(ch : Char) {
        "use strict";
        return renderModifiers[ch] && (ch.charCodeAt(0) >>> 4) + 1;
    }


    processCharacter(text : string, chIdx : number) : number {
        "use strict";
        let ch: Char = text[chIdx];
        let controlSequenceLength = ControlCharacterProcessor._isControlSequenceStart(ch);
        if (controlSequenceLength) {
            let controlCharacterAtPosition: ControlCharacterAtPosition =
                {position: chIdx, character: ch, parameters: text.substring(1, 1 + chIdx + controlSequenceLength)};
            this.controlCharacterMap.push(controlCharacterAtPosition);
            return controlSequenceLength;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx : number, x : number) {
        let controlCharacterAtPosition = this.controlCharacterMap.find(controlCharacterAtPosition => controlCharacterAtPosition.position === chIdx);
        if (controlCharacterAtPosition) {
            this.renderControlsAtPositions.push({
                x: x,
                character: controlCharacterAtPosition.character,
                parameters: controlCharacterAtPosition.parameters
            });
        }
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap : Bitmap, contentLength : number) : void {
        for (let renderControlAtPosition of this.renderControlsAtPositions) {
            let renderModifierFactory : RenderModifierFactory = renderModifiers[renderControlAtPosition.character];
            let renderModifier : RenderModifier = renderModifierFactory(renderControlAtPosition.parameters);
            renderModifier.render(bitmap, renderControlAtPosition, contentLength);
        }
    }
}
module.exports = ControlCharacterProcessor;