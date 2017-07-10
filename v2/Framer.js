// @flow

const SimpleTypes = require("./SimpleTypes.js");
import type {Animation} from "./animations/Animation";
import type {AnimationType, MessageType} from "./message/MessageType";
//import type {TextInFrame} from "./Message";

const NoAnimation = require("./animations/NoAnimation.js");
const Message = require("./Message.js");
const Scrolling = require("./animations/Scrolling.js");
const Frame = require("./Frame.js");
const PagingAnimation = require("./animations/Paging.js");

let animationFactory = (animationSpec : AnimationType) : Animation => {
    "use strict";
    switch (animationSpec.animationName) {
        case "NoAnimation" : return new NoAnimation(animationSpec.timeoutTicks, animationSpec.alignment);
        case "PagingAnimation" : return new PagingAnimation(animationSpec.ticksPerPage);
        case "ScrollingAnimation": return new Scrolling();
        default: throw new Error("Unknown animation type: " + animationSpec.name);
    }
};

class Framer {

  parse(messageType : MessageType) : Message { // TODO: Provide sensible default when spec characters are not present
      return new Message(messageType.map(part => ({
          frame : new Frame(part.start, part.end - part.start, animationFactory(((part : any) : AnimationType)), part.lines),
          text: part.text,

      })));
  }

}

module.exports = Framer;