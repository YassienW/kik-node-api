crypto = require("../cryptoUtils")

module.exports = (groupJid, msg) => {
    let timestamp = new Date().getTime()
    return({
        message: {
            _attributes: {
                type: "groupchat",
                to: groupJid,
                id: crypto.generateUUID(),
                cts: timestamp
            },
            body: {
                _text: msg
            },
            preview: {
                _text: msg.substring(0, 20)
            },
            kik: {
                _attributes: {
                    push: "true",
                    qos: "true",
                    timestamp: timestamp
                }
            },
            request: {
                _attributes: {
                    xmlns: "kik:message:receipt",
                    r: "true",
                    d: "true"
                }
            },
            ri: {
                _text: ""
            }
        }
    })
}
