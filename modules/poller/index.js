var services = {};
var intervalObject = undefined;
var async = require("async");
var parallelLimit = 3;

exports.register = function(service, ttl) {
    services[service.id] = {service: service, status: "enabled", ttl: ttl, lastUpdate: 0, isUpdating: false, value: undefined};
};

exports.startAll = function() {
    poll();
    intervalObject = setInterval(poll, 1000);
    intervalObject.unref();
};

function poll() {
    var toPoll = [];
    var now = new Date().getTime();
    for(var serviceSpec in services ) {
        if (!services.hasOwnProperty(serviceSpec)) {
            continue;
        } else if (serviceSpec.status != "enabled") {
            continue;
        } else if (serviceSpec.lastUpdate + serviceSpec.ttl > now) {
            continue;
        } else if (serviceSpec.isUpdating) {
            continue;
        }
        toPoll.push(function(serviceSpec) {
            console.log("Polling ", serviceSpec);
            serviceSpec.service.update(function(err, result) {
                serviceSpec.value = result;
                serviceSpec.error = err;
                serviceSpec.isUpdating = false;
            })
        }.bind(this, serviceSpec));
    }
    async.parallelLimit(toPoll, parallelLimit, function(err, results) {
        if (err) {
            console.error("Error polling services", err);
        }
    });
}

exports.disable = function(service) {
    services[service.id].status = "disabled";
};

exports.enable = function(service) {
    services[service.id].status = "enabled";
};