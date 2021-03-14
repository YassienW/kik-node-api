const fs = require("fs");

class Logger {
    //warning, error, info, raw
    constructor(fileTypes, consoleTypes, username){
        this.fileTypes = fileTypes || ["warning", "error", "info", "raw"];
        this.consoleTypes = consoleTypes || ["warning", "error", "info"];
        this.username = username;

        if(!fs.existsSync("./logs")){
            fs.mkdirSync("./logs");
        }
    }
    log(type, msg){
        let date = new Date();
        let logTxt = `[${date.getHours()}:${date.getMinutes()}] ${type.toUpperCase()}: ${msg}`;
        if(this.consoleTypes.includes(type)){
            console.log(logTxt);
        }
        if(this.fileTypes.includes(type)){
            fs.appendFileSync(`./logs/${this.username.match(/\\S+@\\S+\\.\\S+/)? `TEMP_${this.username}` : this.username}.txt`,
                `${logTxt}\n`);
        }
    }
    updateUsername(newUsername){
        this.username = newUsername;
    }
}
module.exports = Logger;
