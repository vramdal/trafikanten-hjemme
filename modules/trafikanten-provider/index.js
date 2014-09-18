var request = require("superagent"); // http://visionmedia.github.io/superagent/

module.destinationId = 3010230;

module.update = function() {
    request.get({
        "host": "reis.trafikanten.no",
        "port": 80,
        "path": "/reisrest/realtime/getalldepartures/" + module.destinationId
    }, function(resp) {
        resp.on("data")
    });
    request.get("http://reis.trafikanten.no/reisrest/realtime/getalldepartures/" + module.destinationId)
            .end(function(res) {
                if (res.ok) {
                    value = res.body;
                    error = undefined;
                } else {
                    value = undefined;
                    error = res.text;
                }
            });
};

