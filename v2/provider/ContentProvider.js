// @flow

import type {MessageType, PlaylistType} from "../message/MessageType";
export interface ContentProvider {

    getContent() : ?(MessageType | PlaylistType)

}