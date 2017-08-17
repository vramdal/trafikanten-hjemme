// @flow

import type {PlaylistType} from "../message/MessageType";

export interface PlaylistProvider {

    getPlaylist() : PlaylistType
    
}
