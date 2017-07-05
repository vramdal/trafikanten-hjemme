// @flow

const SimpleTypes = require("./SimpleTypes.js");
import type {Animation} from "./animations/Animation";
import type {TextInFrame} from "./Message";

const NoAnimation = require("./animations/NoAnimation.js");
const Message = require("./Message.js");
const Scrolling = require("./animations/Scrolling.js");
const Frame = require("./Frame.js");
const Paging = require("./animations/Paging.js");

const AnimationCharacterMap = {
    '\x01' : NoAnimation,
    '\x02' : Scrolling,
    '\x03' : Paging
};

// const FRAME_SPEC_FORMAT = [x, width, animation, ...animation parameters]

type FrameSpec = {
    x: number,
    end: number,
    animationClass : $Subtype<Animation>,
    animationParameters : Array<number>,
    lines : number
}

class Framer {

  parse(str : string) : Message { // TODO: Provide sensible default when spec characters are not present
      // TODO: Validate format
      if (str[0] !== SimpleTypes.FORMAT_SPECIFIER_START) {
          throw new Error(`String must start with FORMAT_SPECIFIER_START (charcode ${SimpleTypes.FORMAT_SPECIFIER_START})`);
      }
      let parts = this.splitMessageIntoParts(str);

      let messageParts : Array<TextInFrame> = parts.map(strPart => {
          if (strPart[0] === SimpleTypes.FORMAT_SPECIFIER_START) {
              let {specLength, frameSpec} = this.parseFrameSpec(strPart);
              let frame = this.createFrame(frameSpec);
              let text = strPart.substring(specLength);
              return {frame, text};
          } else {
              throw new Error("No format specifier");
          }
      });
      return new Message(messageParts);
    }

    //noinspection JSMethodCanBeStatic
    splitMessageIntoParts(str : string) {
        let split = [];
        let previousMatch = undefined;
        for (let i = str.length - 1; i >= 0; i--) {
            let ch = str[i];
            if (ch === SimpleTypes.FORMAT_SPECIFIER_START) {
                split.push(str.substring(i, previousMatch));
                previousMatch = i;
            }
        }

        split.reverse();
        return split;
    }

    parseFrameSpec(str : string) : {specLength : number, frameSpec : FrameSpec} {
        let argumentIdx = 1;
        // [0] = FORMAT_SPECIFIER_START
        let x = str.charCodeAt(argumentIdx++);
        let end = str.charCodeAt(argumentIdx++);
        let lines = str.charCodeAt(argumentIdx++);
        let animationId = str[argumentIdx++];
        let animationClass  : $Subtype<Animation> = AnimationCharacterMap[animationId];
        if (!animationClass) {
            throw new Error(`Invalid animation code \\x${animationId.charCodeAt(0).toString(16)} in format specifier ${str.substring(0, 5).split("").map(ch => ch.charCodeAt(0).toString(16)).map(hex => "\\x" + hex).join(",")}`);
        }
        let numberOfAnimationParameters = animationClass.length;
        let animationParameters : Array<number> = [];
        for (let i = 0; i < numberOfAnimationParameters; i++) {
            animationParameters[i] = str.charCodeAt(i + argumentIdx);
        }
        // FORMAT_SPECIFIER_END
        return {
            specLength : argumentIdx + numberOfAnimationParameters + 1,
            frameSpec: {x, end, animationClass, animationParameters, lines}
        };
    }

    //noinspection JSMethodCanBeStatic
    createFrame(frameSpec : FrameSpec) {
        let {x , end , animationClass , animationParameters, lines } = frameSpec;
        let animation : Animation = new animationClass(animationParameters);
        return new Frame(x, end - x, animation, lines);
    }

}

module.exports = Framer;