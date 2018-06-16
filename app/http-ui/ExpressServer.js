// @flow

const express = require('express');
const http = require('http');
const settings = require("../settings");
const cors = require('cors');

export type ExpressServer = {};

function createHttpUiServer(port : number = 6060, isDevEnv : boolean = false) : Promise<ExpressServer> {
    let app = express();
    app.use("/display", express.static('public'));
    app.use("/config", express.static("../../frontend/build"));
    app.use(express.json());
    const corsOptions = {
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    app.use(cors(corsOptions));
    app.get("/config.json", (req, res) => {
        res.json(settings.all());
    });
    app.post("/config.json", (req, res) => {
        const config = req.body;
        console.log("body", config);
        settings.setAll(config);
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
