const crypto = require("../cryptoUtils");

//parsed jids work here
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
                add: {
                    _attributes: {
                        jid: jid
                    }
                }
            },
        }
    });
};
