// @flow

const express = require('express');
const http = require('http');
const settings = require("../settings");

export type ExpressServer = {};

function createHttpUiServer(port : number = 6060, isDevEnv : boolean = false) : Promise<ExpressServer> {
    let app = express();
    app.use("/display", express.static('public'));
    app.use("/config", express.static("../../frontend/build"));
    app.get("/config.json", (req, res) => {
        res.json(settings.all());
    });
    let expressServer = http.createServer(this.app);
    return new Promise((resolve, reject) => {
        app.listen(port, () => {
            console.log("Express server listening on %d", port);
            return resolve(expressServer);
        })
    })

}
module.exports = {createHttpUiServer};
