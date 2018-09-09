// @flow

const WebSocket = require("ws");

const Display = require("./Display.js");

import type {DisplayInterface} from "./DisplayInterface";
import type {ExpressServer} from "../http-ui/ExpressServer";

class WebsocketDisplay extends Display implements DisplayInterface {

    _webSocketServer: Object;

    constructor(port : number = 6061) {
        super();

        this._webSocketServer = new WebSocket.Server({port: port });
        this._webSocketServer.on('connection', (ws) => {
            ws.on('message', (message) => {
                console.log("Received message: ", message);
            });
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