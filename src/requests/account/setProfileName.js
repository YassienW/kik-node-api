const crypto = require("../../helpers/cryptoUtils");

module.exports = (firstName, lastName) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID()
            },
            query: {
                _attributes: {
                    xmlns: "kik:iq:user-profile"
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

