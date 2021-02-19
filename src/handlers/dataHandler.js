const messageHandler = require("./messageHandler"),
    iqHandler = require("./iqHandler");

class DataHandler{
    constructor(client){
        this.client = client;

        //keeps track of all callbacks via uuid
        this.callbacks = new Map();
    }
    addCallback(id, callback){
        this.callbacks.set(id, callback);
    }
    handleData(data){
        //data here is a JSSoup element i can directly consume data from
        if(data.find("k")) {
            if(data.find("k").attrs.ts){ this.client.emit("authenticated"); this.client.getRoster(); }
            else{ this.client.getNode(); }
        }else if(data.find("iq")){
            let id = data.find("iq").attrs.id;
            iqHandler(this.client, this.callbacks, id, data);
        }else if(data.find("message")){
            let id = data.find("message").attrs.id;
            messageHandler(this.client, this.callbacks, id, data);
        }else if(data.find("ack")){
            //do nothing for now
        }else{
            this.client.logger.log("info", "Received Unhandled Data");
        }
    }
}
module.exports = DataHandler;