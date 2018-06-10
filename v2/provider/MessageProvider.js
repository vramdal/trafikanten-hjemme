// @flow
import type {PlaylistProvider} from "./PlaylistProvider";
import type {MessageType} from "../message/MessageType";

// noinspection JSUnusedGlobalSymbols
export interface MessageProvider {

    getMessage() : MessageType,
    getMessageAsync(fresh : boolean) : Promise<MessageType>;
    shutdown() : void;
    isReady? : () => boolean

}

export type ProviderUnion = MessageProvider | PlaylistProvider;
export type AdapterUnion = MessageProviderIcalAdapter<MessageProvider> | MessageProviderIcalAdapter<PlaylistProvider>;

export interface MessageProviderIcalAdapter<ProviderUnion> {
    constructor(arg1 : any, arg2: any, ...rest : Array<any>) : void;
    createMessageProvider(id : string, options: any) : ProviderUnion;
    displayName? : string;
}

