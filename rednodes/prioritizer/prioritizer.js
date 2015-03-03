var RED = require("node-red");
var events = require("../../modules/redevents");

module.exports = function(RED) {
    function prioritizer(config) {
        RED.nodes.createNode(this, config);
        RED.log.addHandler(this);
        var _this = this;
        _this.providerIds = config["priorities"];
        _this.defaultExpiryMs = 1000; // TODO - configurable per provider
        _this.messageIdProviderIdMap = {};
        _this.prioritizedMessages = [];
        _this.messageIdPriorityMap = {};
        this.on("log", function(metric) {
            if (metric.event == "Node.prototype.send") {
                if (_this.providerIds.indexOf(metric.nodeid) != -1) {
                    _this.messageIdProviderIdMap[metric.msguuid] = {
                        "sender": metric.nodeid,
                        "timestamp": new Date()
                    }
                }
            }
        });
        events.on("messageDisplayComplete", function(msgId) {
            console.log("Visning av", msgId, "er ferdig");
            _this.removeMessageIfExpired(msgId);
            _this.sendNextMsg();
        });
        this.removeMessageIfExpired = function(msgId) {
            var messagePriority = _this.messageIdPriorityMap[msgId];
            if (messagePriority != undefined) {
                var msg = _this.prioritizedMessages[messagePriority.priority];
                var now = new Date();
                //if (now.getTime() - msg.sent.getTime() + _this.defaultExpiryMs < 0) { // TODO
                    delete _this.messageIdPriorityMap[msgId];
                    delete _this.prioritizedMessages[messagePriority.priority];
                //}
            }
        };
        this.on("input", function(msg) {
            var priority = Number.MAX_VALUE;
            var msgId = msg["_messageUuid"];
            if (_this.messageIdProviderIdMap[msgId] == undefined) {
                console.warn("Unknown sender for message, cannot prioritize. Using default priority." + msgId);
            } else {
                var senderId = _this.messageIdProviderIdMap[msgId]["sender"];
                delete _this.messageIdProviderIdMap[msgId];
                priority = _this.providerIds.indexOf(senderId);
                if (priority == -1) {
                    console.warn("Unknown provider id " + senderId + " for message " + msgId);
                    priority = Number.MAX_VALUE;
                }
            }
            msg.priority = priority;
            _this.prioritizedMessages[priority] = msg;
            _this.messageIdPriorityMap[msgId] = {priority: priority};
            _this.sendNextMsg();
        });
        this.sendNextMsg = function() {
            for (var i = 0; i < _this.prioritizedMessages.length; i++) {
                var msg = _this.prioritizedMessages[i];
                if (msg != undefined) {
                    msg.sent = new Date();
                    var outgoingNum = _this.wires[0].length;
                    var msgArr = [];
                    for (var j = 0; j < outgoingNum; j++) {
                        msgArr.push(msg);
                    }
                    var clone = JSON.parse(JSON.stringify(msgArr)); // If not, subsequent nodes will alter the message in our priritizedMessages array
                    _this.send(clone);
                    break;
                }
            }
        }

    }
    RED.nodes.registerType("prioritizer", prioritizer);
};