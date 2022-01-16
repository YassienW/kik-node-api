const messageHandler = require("./messageHandler"),
    iqHandler = require("./iqHandler");

class DataHandler {
    constructor(client) {
        this.client = client;

        //keeps track of all callbacks via uuid
        this.callbacks = new Map();
    }
    addCallback(id, callback) {
        this.callbacks.set(id, callback);
    }
    handleData(data) {
        //data here is a JSSoup element i can directly consume data from
        if (data.find("k")) {
            this.started = false;
            if (data.find("k").attrs.ts) {
                this.client.emit("authenticated");
                this.client.getRoster();
            } else if (data.find("noauth")) {
                this.client.emit("loginerrorr", "noauth");
                // this.client.disconnect();
                this.client.logger.log("info", "This account is logged in on another client. Please delete sessions folder and retry.");
            } else {
                this.client.getNode();
            }
        } else if (data.find("iq")) {
            this.started = false;
            let id = data.find("iq").attrs.id;
            iqHandler(this.client, this.callbacks, id, data);

        } else if (data.find("message")) {
            this.started = false;
            let id = data.find("message").attrs.id;
            messageHandler(this.client, this.callbacks, id, data);

        } else if (data.find("ack")) {
            this.started = false;
            //do nothing for now

        } else if (data.find("pong")) {
            //
            if (!this.started) {
                this.started = true;
                setTimeout(() => {
                    this.client.connection.socket.write("<ping />");
                }, 60000);
            }
        } else {
            if (!this.started) {
                this.started = true;
                this.client.connection.socket.write("<ping />");
            }
            // this.client.logger.log("info", "Received Unhandled Data");
        }
    }
}
module.exports = DataHandler;
