const messageHandler = require("./messageHandler"),
    iqHandler = require("./iqHandler")

class DataHandler{
    constructor(client){
        this.client = client

        this.callbacks = new Map()
    }
    addCallback(id, callback){
        this.callbacks.set(id, callback)
    }
    handleData(data){
        //data here is a JSSoup element i can directly consume data from
        if(data.find("k")){
            if(data.find("k").attrs.ts){
                client.emit("authenticated")
                client.getRoster()
            }else{
                client.getNode()
            }
        }else if(data.find("iq")){
            let id = data.find("iq").attrs.id
            iqHandler(this.client, id, data)

        }else if(data.find("message")){
            let id = data.find("message").attrs.id
            messageHandler(this.client, id, data)

        }else{
            console.log("Unhandled Data")
        }
    }
}
module.exports = DataHandler
