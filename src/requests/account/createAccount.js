const crypto = require("../../helpers/cryptoUtils");
const {kikVersionInfo, device} = require("../../config");
const {generatePasskey} = require("../../helpers/cryptoUtils");

module.exports = (email, username, password, firstName, lastName, birthdate, deviceId, androidId, captchaResponse) => {
    let id = crypto.generateUUID();
    return({
        id: id,
        xml: {
            iq: {
                _attributes: {
                    type: "set",
                    id,
                },
                query: {
                    _attributes: {
                        xmlns: "jabber:iq:register"
                    },
                    email: {
                        _text: email
                    },
                    "passkey-e": {
                        _text: generatePasskey(email, password)
                    },
                    "passkey-u": {
                        _text: generatePasskey(username, password)
                    },
                    "device-id": {
                        _text: deviceId
                    },
                    username: {
                        _text: username
                    },
                    first: {
                        _text: firstName
                    },
                    last: {
                        _text: lastName
                    },
                    birthday: {
                        _text: birthdate
                    },
                    challenge: {
                        response: {
                            _text: captchaResponse
                        }
                    },
                    version: {
                        _text: kikVersionInfo.version,
                    },
                    "device-type": {
                        _text: device.type
                    },
                    "model": {
                        _text: device.model
                    },
                    "android-sdk": {
                        _text: device.androidSdk
                    },
                    "registrations-since-install": {
                        _text: 1
                    },
                    "install-date": {
                        _text: "unknown"
                    },
                    "logins-since-install": {
                        _text: 0
                    },
                    prefix: {
                        _text: "CAN"
                    },
                    lang: {
                        _text: "en_US"
                    },
                    brand: {
                        _text: device.brand
                    },
                    "android-id": {
                        _text: androidId
                    },
                },
            }
        }
    });
};
