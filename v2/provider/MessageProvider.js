// @flow
import type {PlaylistProvider} from "./PlaylistProvider";
import type {MessageType} from "../message/MessageType";

export interface MessageProvider {

    getMessage() : MessageType;

}

type ProviderUnion = MessageProvider | PlaylistProvider;

export interface MessageProviderIcalAdapter<ProviderUnion> {

    createMessageProvider(id : string, options: any) : ?ProviderUnion;

}
