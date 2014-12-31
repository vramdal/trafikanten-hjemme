module.exports = function scroller(caller, length) {
    var _this = this;
    this.scrollDistance = 0;
    this.bytes = undefined;
    this.msgBytes = [];
    this.msgString = undefined;
    this.queuedMessagePriority = 10;
    this.msg = undefined;
    this.length = length;
    var emptyScreen = [];
    for (var i = 0; i < 128; i++) {
        emptyScreen.push(0);
    }

    this.setMsg = function(msg) {
        _this.msg = msg;
        var payload = msg.payload;
        if (!Array.isArray(payload)) {
            throw new Error("Non-array received", payload);
        }
        if (!msg.priority) {
            msg.priority = 10;
        }
        if (msg.priority > this.queuedMessagePriority) {
            //noinspection UnnecessaryReturnStatementJS
            return;
        } else if (msg.urgent) {
            this.queuedMessagePriority = 0;
            this.msgBytes = payload.slice(0);
            this.bytes = emptyScreen.concat(this.msgBytes, emptyScreen);
            this.scrollDistance = 0;
        } else {
            this.queuedMessagePriority = msg.priority;
            this.msgBytes = payload.slice(0);
        }
    };

    this.doScroll = function() {
        if (this.bytes == undefined) {
            this.bytes = emptyScreen.concat(this.msgBytes, emptyScreen);
        }
        var visibleBytes = [];
        if (this.scrollDistance > 0) {
            visibleBytes = this.bytes.slice(this.scrollDistance, this.scrollDistance + this.length);
        } else if (this.scrollDistance == 0) {
            visibleBytes = this.bytes.slice(this.scrollDistance, this.scrollDistance + this.length);
        } else if (this.scrollDistance < 0) {
            visibleBytes = this.bytes.slice();
        }


        this.msg.payload = visibleBytes;
        this.msg.topic = "bitmap";
        this.msg.scrollDistance = this.scrollDistance;
        caller.send(this.msg);
        this.scrollDistance += 1;
        if (this.scrollDistance > this.bytes.length - this.length) {
            this.scrollDistance = 0;
            this.bytes = emptyScreen.concat(this.msgBytes, emptyScreen);
            this.queuedMessagePriority = 10;
            caller.reInit();
        }

    }
};
