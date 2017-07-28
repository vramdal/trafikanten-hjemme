// @flow

import type {MessageType} from "../message/MessageType";
export interface ContentProvider {

    getContent() : ?(MessageType | Array<MessageType>)

}