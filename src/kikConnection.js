//lower level connection stuff
const tls = require("tls"),
    EventEmitter = require("events"),
    logger = require("./logger"),
    convert = require("xml-js"),
    JSSoup = require("jssoup").default;

class KikConnection extends EventEmitter{
    constructor(callback){
        super()

        this.socket = tls.connect({
            host: "talk1110an.kik.com",
            port: 5223
        });
        this.socket.on("connect", () => {
            logger.log("Connected to kik")
            callback()
        })
        this.socket.on("end", () => {
            callback("Server ended")
        })
        this.socket.on("error", err => {
            callback(err)
        })
        this.socket.on("data", data => {
            logger.log("Received data: " + data)
            this.emit("data", new JSSoup(data))
        })
    }
    disconnect(){
        this.socket.destroy()
    }
    sendXmlFromJson(json, removeClosingTag){
        let xml = convert.json2xml(json, {compact: true})
        xml = (removeClosingTag? xml.slice(0, xml.length - 2) + ">" : xml)
        logger.log(`Writing XML to server: ${xml}`)
        this.socket.write(xml)
    }
    sendRawData(data){
        logger.log(`Writing raw to server: ${data}`)
        this.socket.write(data)
    }
}
module.exports = KikConnection
