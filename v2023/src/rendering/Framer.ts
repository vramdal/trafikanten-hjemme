import type { Animation } from "../animations/Animation";
import type { AnimationType, MessageType, PlaylistType, } from "../message/MessageType";
import Message from "../types/Message";
import NoAnimation from "../animations/NoAnimation";
import Scrolling from "../animations/Scrolling";
import Frame from "../bitmap/Frame";

// import PagingAnimation from "../animations/Paging";

// import VerticalScrollingAnimation from "../animations/VerticalScrolling.js";

let animationFactory = (animationSpec : AnimationType) : Animation => {
    "use strict";
    switch (animationSpec.animationName) {
        case "NoAnimation" : return new NoAnimation(animationSpec.timeoutTicks, animationSpec.alignment);
        // case "PagingAnimation" : return new PagingAnimation(animationSpec.ticksPerPage);
        case "ScrollingAnimation": return new Scrolling();
        // case "VerticalScrollingAnimation": return new VerticalScrollingAnimation(animationSpec.holdOnLine, animationSpec.holdOnLastLine, animationSpec.alignment, animationSpec.scrollIn, animationSpec.scrollOut);
        default: throw new Error("Unknown animation type: " + (animationSpec as any).animationName);
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
        if ("playlistId" in messageOrPlaylistType) {
            playlistType = messageOrPlaylistType;
        } else {
            playlistType = Object.assign([messageOrPlaylistType], {playlistId: (messageOrPlaylistType as MessageType).messageId + "-playlist"});
        }
        return playlistType;
    }

    createMessage(messageType : MessageType) {
        try {
            console.log("Creating message for ", JSON.stringify(messageType));
            return new Message(messageType.map(part => ({
                frame: new Frame(part.start, part.end - part.start, animationFactory((part.animation)), part.lines),
                text: part.text
            })));
        } catch (e) {
            console.error("Error creating message for ", JSON.stringify(messageType), e);
            throw e;
        }
    }

}

export default Framer;
