const crypto = require("../../utility/cryptoUtils");

//true promotes, false demotes
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
                    m: {
                        _attributes: {
                            a: (bool? "1": "0")
                        },
                        _text: userJid
                    }
                }
            }
        }
    });
};

