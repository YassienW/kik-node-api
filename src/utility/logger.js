const fs = require("fs");

class Logger {
    //warning, error, info, raw
    constructor(types, username){
        this.types = (types? types : ["warning", "error", "info", "raw"]);
        this.username = username;

        if(!fs.existsSync("./logs")){ fs.mkdirSync("./logs"); }
    }
    log(type, msg){
        let date = new Date();
        let logTxt = `[${date.getHours()}:${date.getMinutes()}] ${type.toUpperCase()}: Client: (${this.username}): ${msg}`;
        if(this.types.includes(type)){ console.log(logTxt); }
        fs.appendFileSync(`./logs/${this.username}.txt`, `${logTxt}\n`);
    }
}
module.exports = Logger;