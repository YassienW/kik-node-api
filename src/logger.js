const fs = require("fs")

class Logger {
    //warning, error, info, raw
    constructor(types, username){
        this.types = (types? types : ["warning", "error", "info", "raw"])
        this.username = username

        if(!fs.existsSync("./logs")){
            fs.mkdirSync("./logs")
        }
    }
    log(type, msg){
        if(this.types.includes(type)){
            console.log(`${type.toUpperCase()}: ${msg}`)
        }
        fs.appendFileSync(`./logs/${this.username}.txt`, `${type.toUpperCase()}: ${msg}\n`)
    }
}
module.exports = Logger
