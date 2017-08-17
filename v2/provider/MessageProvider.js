// @flow

import type {MessageType} from "../message/MessageType";

export interface MessageProvider {

    getMessage() : MessageType;

}
