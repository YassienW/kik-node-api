const crypto = require("../cryptoUtils");

module.exports = (jid, msg, isGroup) => {
    let timestamp = new Date().getTime(), id = crypto.generateUUID();
    let type = (isGroup? "groupchat" : "chat");
    return({
        id: id,
        xml: {
            message: {
                _attributes: {
                    xmlns: "jabber:client",
                    type: type,
                    to: jid,
                    id: id,
                    cts: timestamp
                },
                // body: {
                //     _text: msg
                // },
                preview: {
                    _text: msg.substring(0, 20)
                },
                kik: [{
                    _attributes: {
                        push: "true",
                        qos: "true",
                        timestamp: timestamp
                    }
                },
                {
                    _attributes: {
                        // push: "true",
                        // qos: "true", 
                        timestamp: timestamp
                    },
                    sysmsg: {
                        _text: msg
                    }}],
                // request: {
                //     _attributes: {
                //         //xmlns: "kik:message:receipt",
                //         r: "true",
                //         d: "true"
                //     }
                // },
                // ri: {
                //     _text: ""
                // }
            }
        }
    });
};
