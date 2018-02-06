// @flow

const WebSocket = require("ws");
const express = require('express');
const http = require('http');
const url = require('url');

const Display = require("./Display.js");

import type {DisplayInterface} from "./DisplayInterface";
import type {BytePosition} from "./BytePosition";
const PositionTranslator = require("./PositionTranslator.js");

class WebsocketDisplay extends Display implements DisplayInterface {

    _webSocketServer: Object;
    _app: Object;
    _expressServer: Object;
    _positionTranslator : (x : number, y : number) => BytePosition;

    constructor() {
        super();
        this._app = express();

        this._app.use(express.static('public'));
        this._expressServer = http.createServer(this._app);
        this._webSocketServer = new WebSocket.Server({ server: this._expressServer });
        this._webSocketServer.on('connection', (ws) => {
            ws.on('message', (message) => {
                console.log("Received message: ", message);
            });
        });
        this._expressServer.listen(6060, () => {
            console.log("Express server listening on %d", this._expressServer.address().port);
        });
        this._positionTranslator = new PositionTranslator(128, 18, [{x: 0, y: 8, width: 128, height: 2}]).translate;
    }

    getPositionTranslator() : (x : number, y : number) => BytePosition {
        return this._positionTranslator;
    }

    output() {
        // https://github.com/websockets/ws#broadcast-example
        this._webSocketServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(this.buffer);
            }
        });
    }

}

module.exports = WebsocketDisplay;