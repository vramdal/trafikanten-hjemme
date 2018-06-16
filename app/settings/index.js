const fs = require("fs");
const path = require("path");
const FILENAME = ".trafikanten-hjemme.json";
const UserSettings = require('user-settings').file(FILENAME);

module.exports = UserSettings;

let homedir = process.env.HOME || process.env.USERPROFILE,
    filepath = path.join(homedir, FILENAME);

module.exports.all = () => JSON.parse(fs.readFileSync(filepath, "UTF-8"));
module.exports.setAll = (obj => {
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) {
            return;
        }
        UserSettings.set(key, obj[key]);
    }
    fs.writeFileSync(filepath, JSON.stringify(obj, undefined, 3));
});