// @flow

const SimpleTypes = require("./SimpleTypes.js");
import type {Animation} from "./animations/Animation";
import type {TextInFrame} from "./Message";

const NoAnimation = require("./animations/NoAnimation.js");
const Message = require("./Message.js");
const Scrolling = require("./animations/Scrolling.js");
const Frame = require("./Frame.js");

const AnimationCharacterMap = {
    '\x01' : NoAnimation,
    '\x02' : Scrolling
};

// const FRAME_SPEC_FORMAT = [x, width, animation, ...animation parameters]

type FrameSpec = {
    x: number,
    end: number,
    animationClass : $Subtype<Animation>,
    animationParameters : Array<number>
}

// TODO: Write tests

class Framer {

  parse(str : string) : Message { // TODO: Provide sensible default when spec characters are not present
      // TODO: Validate format
        let split = str.split(SimpleTypes.MESSAGE_PART_SEPARATOR);
        let parts : Array<TextInFrame> = split.map(strPart => {
            if (strPart[0] === SimpleTypes.FORMAT_SPECIFIER_START) {
                let {specLength, frameSpec} = this.parseFrameSpec(str);
                let frame = this.createFrame(frameSpec);
                let text = strPart.substring(specLength);
                return {frame, text};
            } else {
                throw new Error("No format specifier");
            }
        });
        return new Message(parts);
    }

    parseFrameSpec(str : string) : {specLength : number, frameSpec : FrameSpec} {
        // [0] = FORMAT_SPECIFIER_START
        let x = str.charCodeAt(1);
        let end = str.charCodeAt(2);
        let animationId = str[3];
        let animationClass  : $Subtype<Animation> = AnimationCharacterMap[animationId];
        if (!animationClass) {
            throw new Error(`Invalid animation code ${animationId.charCodeAt(0)}`);
        }
        let numberOfAnimationParameters = animationClass.constructor.length;
        let animationParameters : Array<number> = [];
        for (let i = 0; i < numberOfAnimationParameters; i++) {
            animationParameters[i] = str.charCodeAt(i + 4);
        }
        // FORMAT_SPECIFIER_END
        return {
            specLength : 5 + numberOfAnimationParameters,
            frameSpec: {x, end, animationClass, animationParameters}
        };
    }

    //noinspection JSMethodCanBeStatic
    createFrame(frameSpec : FrameSpec) {
        let {x , end , animationClass , animationParameters } = frameSpec;
        let animation : Animation = new animationClass(animationParameters);
        return new Frame(x, end - x, animation);
    }

}

module.exports = Framer;