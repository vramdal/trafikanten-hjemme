// @flow

import type {Animation} from "../animations/Animation";
import type {AnimationType, MessageType, PlaylistType} from "../message/MessageType";
//import type {TextInFrame} from "./Message";

const NoAnimation = require("../animations/NoAnimation.js");
const Message = require("../types/Message.js");
const Scrolling = require("../animations/Scrolling.js");
const Frame = require("../bitmap/Frame.js");
const PagingAnimation = require("../animations/Paging.js");
const VerticalScrollingAnimation = require("../animations/VerticalScrolling.js");

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

  parse(messageOrPlaylistType : (MessageType | PlaylistType)) : Array<Message> {
      let playlistType = this.assertPlaylist(messageOrPlaylistType);
      return playlistType.map(this.createMessage);
  }

    //noinspection JSMethodCanBeStatic
    assertPlaylist(messageOrPlaylistType : (MessageType | PlaylistType)) {
        let playlistType: PlaylistType;
        if (messageOrPlaylistType.playlistId) {
            playlistType = messageOrPlaylistType;
        } else {
            let playlistArray: PlaylistType = [messageOrPlaylistType];
            playlistArray.playlistId = (messageOrPlaylistType: MessageType).messageId + "-playlist";
            playlistType = playlistArray;
        }
        return playlistType;
    }

    createMessage(messageType : MessageType) {
        try {
            console.log("Creating message for ", JSON.stringify(messageType));
            return new Message(messageType.map(part => ({
                frame: new Frame(part.start, part.end - part.start, animationFactory((part.animation: AnimationType))),
                text: part.text
            })));
        } catch (e) {
            console.error("Error creating message for ", JSON.stringify(messageType), e);
            throw e;
        }
    }

}

module.exports = Framer;
