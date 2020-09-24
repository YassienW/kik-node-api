const crypto = require("../../cryptoUtils");

module.exports = (oldPassword, newPassword) => {
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
                "passkey-e": {
                    _text: oldPassword
                },
                "passkey-u": {
                    _text: newPassword
                }
            }
        }
    });
};
