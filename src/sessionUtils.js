const fs = require("fs"),
    crypto = require("crypto"),
    sessionUtils = module.exports;

sessionUtils.createSession = () => {
    return {
        deviceID: crypto.randomBytes(16).toString("hex"),
        androidID: crypto.randomBytes(8).toString("hex")
    };
};
sessionUtils.getSession = (username) => {
    if(fs.existsSync(`./sessions/${username}.json`)){
        return JSON.parse(fs.readFileSync(`./sessions/${username}.json`));
    }
};
sessionUtils.saveSession = (username, session) => {
    if(!fs.existsSync("./sessions")){
        fs.mkdirSync("./sessions");
    }
    fs.writeFileSync(`./sessions/${username}.json`, JSON.stringify(session));
};

