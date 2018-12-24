//lower level connection stuff
const tls = require("tls"),
    EventEmitter = require("events"),
    convert = require("xml-js"),
    JSSoup = require("jssoup").default;

class KikConnection extends EventEmitter{
    constructor(logger, callback){
        super()
        this.logger = logger

        this.socket = tls.connect({
            host: "talk1110an.kik.com",
            port: 5223
        });
        this.socket.on("connect", () => {
            this.logger.log("info", "Connected to kik")
            callback()
        })
        this.socket.on("end", () => {
            callback("Server ended")
        })
        this.socket.on("error", err => {
            callback(err)
        })
        this.socket.on("data", data => {
            this.logger.log("raw", `Received data: ${data}`)
            this.emit("data", new JSSoup(data))
        })
    }
    disconnect(){
        this.socket.destroy()
    }
    sendXmlFromJs(js, removeClosingTag){
        let xml = convert.js2xml(js, {compact: true})
        xml = (removeClosingTag? xml.slice(0, xml.length - 2) + ">" : xml)
        this.logger.log("raw", `Writing XML to server: ${xml}`)
        this.socket.write(xml)
    }
    sendRawData(data){
        this.logger.log("raw", `Writing raw to server: ${data}`)
        this.socket.write(data)
    }
}
module.exports = KikConnection
