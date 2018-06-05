// @flow

import type {PlaylistType} from "../message/MessageType";

// noinspection JSUnusedGlobalSymbols
export interface PlaylistProvider {

    getPlaylist() : PlaylistType,
    getPlaylistAsync() : Promise<PlaylistType>;
    shutdown() : void;

}
