//lower level connection stuff
const tls = require("tls"),
    EventEmitter = require("events"),
    convert = require("xml-js"),
    JSSoup = require("jssoup").default;

class KikConnection extends EventEmitter{
    constructor(logger, callback){
        super();
        this.logger = logger;

        this.socket = tls.connect({
            host: "talk1110an.kik.com",
            port: 5223
        });
        this.socket.on("connect", () => {
            this.logger.log("info", "Connected to kik");
            callback();
        });
        this.socket.on("end", () => {
            callback("Server ended");
        });
        this.socket.on("error", err => {
            callback(err);
        });
        this.packets = []; //create packets array as in this outside socket.on "data" 
        this.socket.on("data", data => {
            //fixed 2 packet limitation
            if(data.length >= 16384){ //keep adding the packets to an array until a packets is smaller than 16384
                this.packets.push(data);
            }else{ //combine the  packet array and the last packet
                let fullPacket;
                let lastPacket = data;
                if(this.packets.length > 0){
                    fullPacket = this.packets.join("") + lastPacket;
                    this.packets = [];
                } else{  // if no packets were added to the array assign last packet as full packet
                    fullPacket = lastPacket;
                    this.packets = [];
                }
                this.emit("data", new JSSoup(fullPacket));
                this.logger.log("raw", `Received data (${fullPacket.length}): ${fullPacket}`);
            }
        });
    }
    disconnect(){
        this.socket.destroy();
    }
    sendXmlFromJs(js, removeClosingTag){
        let xml = convert.js2xml(js, {compact: true});
        xml = (removeClosingTag? xml.slice(0, xml.length - 2) + ">" : xml);
        this.logger.log("raw", `Writing XML to server: ${xml}`);
        this.socket.write(xml);
    }
    sendRawData(data){
        this.logger.log("raw", `Writing raw to server: ${data}`);
        this.socket.write(data);
    }
}
module.exports = KikConnection;
