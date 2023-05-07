import WebSocket, { Server } from "ws";
import type { DisplayInterface } from "./DisplayInterface";

// import type {ExpressServer} from "../http-ui/ExpressServer";
import Display from "./Display";

class WebsocketDisplay extends Display implements DisplayInterface {

    _webSocketServer: WebSocket.Server;

    constructor(port : number = 6061) {
        super();

        this._webSocketServer = new WebSocket.Server({port: port });
        this._webSocketServer.on('connection', (ws: Server) => {
            this.output();
            ws.on('message', (message) => {
                console.log("Received message: ", message);
            });
        });

    }

    output() {
        // https://github.com/websockets/ws#broadcast-example
        this._webSocketServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(this._buffer);
            }
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            this._webSocketServer.clients.forEach(client => {
                client.close();
            })
            this._webSocketServer.close(resolve);
        });
    }

}
export default WebsocketDisplay;
