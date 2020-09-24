const crypto = require("../../cryptoUtils");

module.exports = (firstName, lastName) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID()
            },
            query: {
                _attributes: {
                    xmlns: "kik:iq:user-account"
                },
                first: {
                    _text: firstName
                },
                last: {
                    _text: lastName
                }
            }
        }
    });
};

