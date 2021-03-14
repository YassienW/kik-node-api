const crypto = require("../../helpers/cryptoUtils");

//true adds user, false removes him
//note that you can only add a user using his raw JID
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
                            r: (bool? null: "1")
                        },
                        _text: userJid
                    }
                }
            }
        }
    });
};

