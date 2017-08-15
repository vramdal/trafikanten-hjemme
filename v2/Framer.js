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
const VerticalScrollingAnimation = require("./animations/VerticalScrolling.js");

let animationFactory = (animationSpec : AnimationType) : Animation => {
    "use strict";
    switch (animationSpec.animationName) {
        case "NoAnimation" : return new NoAnimation(animationSpec.timeoutTicks, animationSpec.alignment);
        case "PagingAnimation" : return new PagingAnimation(animationSpec.ticksPerPage);
        case "ScrollingAnimation": return new Scrolling();
        case "VerticalScrollingAnimation": return new VerticalScrollingAnimation(animationSpec.holdOnLine, animationSpec.holdOnLastLine, animationSpec.alignment, animationSpec.scrollIn, animationSpec.scrollOut);
        default: throw new Error("Unknown animation type: " + animationSpec.animationName);
    }
};

class Framer {

  parse(messageType : MessageType) : Message {
      return new Message(messageType.map(part => ({
          frame : new Frame(part.start, part.end - part.start, animationFactory((part.animation : AnimationType)), part.lines),
          text: part.text,

      })));
  }

}

module.exports = Framer;