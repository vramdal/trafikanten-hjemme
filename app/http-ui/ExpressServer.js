// @flow

const express = require('express');
const http = require('http');

export type ExpressServer = {};

function createHttpUiServer(port : number = 6060) : Promise<ExpressServer> {
    let app = express();
    app.use(express.static('public'));
    app.use(express.static("../../frontend/build"));
    let expressServer = http.createServer(this.app);
    return new Promise((resolve, reject) => {
        app.listen(port, () => {
            console.log("Express server listening on %d", port);
            return resolve(expressServer);
        })
    })

}
module.exports = {createHttpUiServer};
