const fs = require("fs"),
    crypto = require("crypto"),
    sessionUtils = module.exports

sessionUtils.getSession = (username) => {
    if(fs.existsSync(`./sessions/${username}.json`)){
        return JSON.parse(fs.readFileSync(`./sessions/${username}.json`))
    }else{
        return {
            deviceID: crypto.randomBytes(16).toString("hex"),
            androidID: crypto.randomBytes(8).toString("hex")
        }
    }
}
sessionUtils.setSession = (username, session) => {
    if(!fs.existsSync("./sessions")){
        fs.mkdirSync("./sessions")
    }
    fs.writeFileSync(`./sessions/${username}.json`, JSON.stringify(session))
}

