// @flow

import type {PlaylistType} from "../message/MessageType";

// noinspection JSUnusedGlobalSymbols
export interface PlaylistProvider {

    getPlaylist() : PlaylistType,
    getPlaylistAsync(fresh : boolean) : Promise<PlaylistType>;
    shutdown() : void;
    title? : string;

}
