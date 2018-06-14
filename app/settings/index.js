const fs = require("fs");
const path = require("path");
const FILENAME = ".trafikanten-hjemme";
const UserSettings = require('user-settings').file(FILENAME);

module.exports = UserSettings;

let homedir = process.env.HOME || process.env.USERPROFILE,
    filepath = path.join(homedir, FILENAME);

module.exports.all = () => JSON.parse(fs.readFileSync(filepath, "UTF-8"));