//lower level connection stuff
const tls = require("tls"),
    EventEmitter = require("events"),
    convert = require("xml-js"),
    JSSoup = require("jssoup").default;

class KikConnection extends EventEmitter{
    constructor(logger, callback){
        super();
        this.logger = logger;

        this.connect();
        this.socket.on("connect", () => {
            this.logger.log("info", "Connected to kik");
            callback();
        });
        this.socket.on("end", () => {
            callback("Server ended");
            this.emit("diconnected");
        });
        this.socket.on("error", err => {
            callback(err);
        });
        this.packets = [];
        this.socket.on("data", data => {
            //apparently this is the max length we can receive in one packet, we have to combine it with the next packet
            //before passing it to the client, to make sure it is a full message, note this ONLY works if the packet
            //is split to 2, 3 would break

            // packets =  [data[s:s+16384].encode() for s in range(0, len(data), 16384)]
            //return list(packets)

            if(data.length >= 16384){
                // this.prevPacket = data;
                this.packets.push(data);
            }else{
                let fullPacket;
                let lastPacket = data;
                if(this.packets.length > 0){
                    fullPacket = this.packets.join("") + lastPacket;
                    this.packets = [];
                    // console.log("its a big packet");
                    // console.log(fullPacket);
                } else{
                    fullPacket = lastPacket;
                    this.packets = [];
                }
                // let fullPacket = data;

                this.emit("data", new JSSoup(fullPacket));
                this.logger.log("raw", `Received data (${fullPacket.length}): ${fullPacket}`);
            }

            //old method
            // if(data.length >= 16384){
            //     this.prevPacket = data;
            // }else{
            //     let fullPacket = data;
            //     if(this.prevPacket){
            //         fullPacket = this.prevPacket + fullPacket;
            //         this.prevPacket = null;
            //     }
            //     this.emit("data", new JSSoup(fullPacket));
            //     this.logger.log("raw", `Received data (${fullPacket.length}): ${fullPacket}`);
            // }
        });
    }
    connect(){
        this.socket = tls.connect({
            host: "talk1110an.kik.com",
            port: 5223
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
