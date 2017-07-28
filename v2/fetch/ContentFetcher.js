// @flow

import type {MessageType} from "../message/MessageType";

export interface ContentFetcher<DataType> {

    fetch() : Promise<DataType>;

    format(data : DataType) : MessageType;

    fetchIntervalSeconds : number;

    id : string

}
