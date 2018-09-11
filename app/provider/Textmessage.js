// @flow
const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;


const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const settings = require("../settings/index");

import type {MessageType} from "../message/MessageType";
import type {MessageProviderIcalAdapter, MessageProvider} from "./MessageProvider";

class Textmessage implements MessageProvider {

    _id: string;

    static factory : Class<MessageProviderIcalAdapter<MessageProvider>>;
    _message: string;
    _formatter : ValueFetcherAndFormatter<string>;
    title : ?string;

    constructor(id: string, dataStore: PreemptiveCache, message : string, title : ?string) {
        this._id = id;
        this._message = message;
        this._formatter = new ValueFetcherAndFormatter(`${id}-fetcher`, dataStore, () => Promise.resolve(this._message), 600, this.format.bind(this), 600, null);
        this.title = title;
    }

    format() : Promise<MessageType> {
        let message = [
            {
                text : this._message,
                animation: {animationName: "VerticalScrollingAnimation",  holdOnLine : 50, holdOnLastLine : 50, alignment: "center", scrollIn : false, scrollOut: true},
                start: 0, end: 128, lines: 2,
            }
        ];
        return Promise.resolve(message);
    }

    getMessage() : ?MessageType {
        return this._formatter.getValue();
    }

    getMessageAsync(fresh : boolean) : Promise<MessageType> {
        return this._formatter.getMessageAsync(fresh);
    }

    shutdown() {

    }
}

class TextmessageProviderFactory implements MessageProviderIcalAdapter<MessageProvider> {
    _dataStore: PreemptiveCache;
    _apiKey : string;

    constructor(dataStore : PreemptiveCache) {
        this._dataStore = dataStore;
        this._apiKey = settings.get("oslobysykkel").apiKey;
    }

    //noinspection JSUnusedGlobalSymbols
    createMessageProvider(id : string, options : {textmessageString: string}, title : ?string) : Textmessage {
        return new Textmessage(id, this._dataStore, options.textmessageString, title);
    }
}

module.exports = Textmessage;
module.exports.factory = TextmessageProviderFactory;