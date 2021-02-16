const crypto = require("../../cryptoUtils");

module.exports = (groupJid, userJid) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID(),
            },
            query: {
                _attributes: {
                    xmlns: "kik:groups:admin"
                },
                g: {
                    _attributes: {
                        jid: groupJid
                    },
                    m: {
                        _text: userJid
                    }
                }
            },
        }
    });
};