const config = require("../config"),
    crypto = require("../cryptoUtils");

module.exports = (username, password, deviceID, androidID, version, captchaResponse) => {
    return({
        iq: {
            _attributes: {
                type: "set",
                id: crypto.generateUUID()
            },
            query: {
                _attributes: {
                    xmlns: "jabber:iq:register"
                },
                username: {
                    _text: username
                },
                "passkey-u": {
                    _text: crypto.generatePasskey(username, password)
                },
                "device-id": {
                    _text: deviceID
                },
                "install-referrer": {
                    _text: "utm_source=google-play&utm_medium=organic"
                },
                operator: {
                    _text: "310260"
                },
                "install-date": {
                    _text: "1595173064023"
                },
                "device-type": {
                    _text: "android"
                },
                brand: {
                    _text: "Google"//"generic"
                },
                "logins-since-install": {
                    _text: "1"
                },
                version: {
                    _text: config(version).kikVersionInfo.version
                },
                lang: {
                    _text: "en_US"
                },
                "android-sdk": {
                    _text: "29"
                },
                "registrations-since-install": {
                    _text: "0"
                },
                prefix: {
                    _text: "CAN"
                },
                "android-id": {
                    _text: androidID
                },
                model: {
                    _text: "Google Pixel 4 XL - 10.0.0 - API 29 - 1440x2960"
                    //"Samsung Galaxy S5 - 4.4.4 - API 19 - 1080x1920"
                },
                challenge: {
                    response: {
                        _text: captchaResponse
                    }
                }
            }
        }
    });
};

