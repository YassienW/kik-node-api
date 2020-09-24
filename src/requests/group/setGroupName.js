const crypto = require("../../cryptoUtils");

module.exports = (groupJid, name) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID()
            },
            query: {
                _attributes: {
                    xmlns: "kik:groups:admin"
                },
                g: {
                    _attributes: {
                        jid: groupJid
                    },
                    n: {
                        _text: name
                    }
                }
            }
        }
    });
};

