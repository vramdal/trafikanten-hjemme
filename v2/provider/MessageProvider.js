// @flow
import type {PlaylistProvider} from "./PlaylistProvider";
import type {MessageType} from "../message/MessageType";

// noinspection JSUnusedGlobalSymbols
export interface MessageProvider {

    getMessage() : MessageType,
    getMessageAsync(fresh : boolean) : Promise<MessageType>;
    shutdown() : void;

}

export type ProviderUnion = MessageProvider | PlaylistProvider;

export interface MessageProviderIcalAdapter<ProviderUnion> {

    createMessageProvider(id : string, options: any) : ProviderUnion;

}
