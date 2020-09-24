const crypto = require("../../cryptoUtils");

//true bans, false unbans
module.exports = (groupJid, userJid, bool) => {
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
                    b: {
                        _attributes: {
                            r: (bool? null: "1")
                        },
                        _text: userJid
                    }
                }
            }
        }
    });
};

