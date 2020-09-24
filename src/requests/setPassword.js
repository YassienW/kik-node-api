const crypto = require("../cryptoUtils");

module.exports = (oldPassword, newPassword) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID(),
            },
            query: {
                _attributes: {
                    xmlns: "kik:iq:user-profile"
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
