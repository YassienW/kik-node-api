crypto = require("../cryptoUtils")

module.exports = (jid, msg, isGroup) => {
    let timestamp = new Date().getTime()
    let type = (isGroup? "groupchat" : "chat")
    return({
        message: {
            _attributes: {
                type: type,
                to: jid,
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
