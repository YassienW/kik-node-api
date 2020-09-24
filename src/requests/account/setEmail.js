const crypto = require("../../cryptoUtils");

module.exports = (newEmail, password) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID(),
            },
            query: {
                _attributes: {
                    xmlns: "kik:iq:user-account"
                },
                "email": {
                    _text: newEmail
                },
                "passkey-e": {
                    _text: password
                }
            }
        }
    });
};
