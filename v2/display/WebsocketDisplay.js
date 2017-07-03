// @flow

const WebSocket = require("ws");
const express = require('express');
const http = require('http');
const url = require('url');

const Display = require("./Display.js");

import type {DisplayInterface} from "./DisplayInterface";

class WebsocketDisplay extends Display implements DisplayInterface {

    _webSocketServer: Object;
    _app: Object;
    _expressServer: Object;

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