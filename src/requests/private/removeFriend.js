const crypto = require("../../utility/cryptoUtils");

//you must use the raw jid here
module.exports = (jid) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID(),
            },
            query: {
                _attributes: {
                    xmlns: "kik:iq:friend"
                },
                remove: {
                    _attributes: {
                        jid: jid
                    }
                }
            },
        }
    });
};
