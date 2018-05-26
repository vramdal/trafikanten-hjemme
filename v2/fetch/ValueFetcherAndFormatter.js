// @flow

import type {MessageType} from "../message/MessageType";
import type {CachedValueProvider} from "./Cache";

const PreemptiveCache = require("./PreemptiveCache.js");
const fetch = require("node-fetch");
const xml2json = require("xml2json");


class ValueFetcherAndFormatter<R> {
    _fetcher : () => Promise<R>;
    _fetchIntervalSeconds: number;
    _formatter : (rawValue : R) => Promise<MessageType>;
    _formatIntervalSeconds: number;
    _loadingMessage: MessageType;
    _id: string;
    _dataStore: PreemptiveCache;
    _rawValueProvider : CachedValueProvider<R>;
    _formattedValueProvider : CachedValueProvider<MessageType>;
    _message : MessageType;

    constructor(
        id : string,
        dataStore : PreemptiveCache,
        fetcher : () => Promise<R>,
        fetchIntervalSeconds : number,
        formatter : (rawValue : R) => Promise<MessageType>,
        formatIntervalSeconds : number = 10,
        loadingMessage : ?MessageType
    ) {
        this._id = id;
        this._dataStore = dataStore;
        this._fetcher = fetcher;
        this._fetchIntervalSeconds = fetchIntervalSeconds;
        this._formatter = formatter;
        this._formatIntervalSeconds = formatIntervalSeconds;
        this._loadingMessage = loadingMessage || [Object.assign({},
            { start: 0, end: 127, text: "Loading data for " + this._id, lines: 2},
            { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50}})]
        ;

        this._rawValueProvider = this._dataStore.registerFetcher(this._fetcher, this._id + "-fetcher", this._fetchIntervalSeconds);
        this._formattedValueProvider = dataStore.registerFetcher(this._format.bind(this), id + "-formatter", this._formatIntervalSeconds);

        this._message = this._loadingMessage;
    }

    _format() {
        return this._rawValueProvider()
            .then((rawValue : R) => this._formatter(rawValue))
            .then((messageType : MessageType) => {
            this._message = messageType;
            return messageType;
        }).catch((error : Error) => {
                console.error(`Error fetching ${this._id}`, error);
                return [Object.assign({},
                    {start: 0, end: 127, text: `Error fetching ${this._id}: ${error.message}`, lines: 2},
                    {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})];
            })
    }

    getValue() : MessageType {
        return this._message;
    }
}

const JsonFetcher = (url : string, options : ?{}) =>
    () => fetch(url, options)
        .then(res => res.json());

const XmlFetcher = (url : string, options : ?{}) =>
    () => fetch(url, options)
        .then(res => res.text())
        .then(body => Promise.resolve(xml2json.toJson(body)))
        .then(json => JSON.parse(json));

const GraphQLFetcher = (url : string, headers: ?{}, graphQLQuery : string, variableFactory : () => {}) => {
    const client = require('graphql-client')({url: url, headers: headers});
    return () => client.query(graphQLQuery, variableFactory(), (req, res) => {
        if (res.status === 401) {
            throw new Error("Noe feil");
        }
    }).then(body => body.data);
};

module.exports = {ValueFetcherAndFormatter, JsonFetcher, XmlFetcher, GraphQLFetcher};