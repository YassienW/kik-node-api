const crypto = require("../../cryptoUtils");

//you must use the raw jid here
module.exports = (groupJid, groupCode, joinToken) => {
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
                        jid: groupJid,
                        action: "join"
                    },
                    code: {
                        _text: groupCode
                    },
                    token: {
                        _text: joinToken
                    }
                }
            },
        }
    });
};
