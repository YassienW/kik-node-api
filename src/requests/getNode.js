const config = require("../config"),
    crypto = require("../cryptoUtils"),
    {device} = require("../config");

module.exports = (usernameOrEmail, password, deviceID, androidID, captchaResponse) => {
    let variableXml;
    if(usernameOrEmail.match(/\S+@\S+\.\S+/)){
        variableXml = {
            email: {
                _text: usernameOrEmail
            },
            "passkey-e": {
                _text: crypto.generatePasskey(usernameOrEmail, password)
            },
        };
    }else{
        variableXml = {
            username: {
                _text: usernameOrEmail
            },
            "passkey-u": {
                _text: crypto.generatePasskey(usernameOrEmail, password)
            },
        };
    }
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
                ...variableXml,
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
                    _text: "1494078709023"
                },
                "device-type": {
                    _text: device.type
                },
                brand: {
                    _text: device.brand
                },
                "logins-since-install": {
                    _text: "1"
                },
                version: {
                    _text: config.kikVersionInfo.version
                },
                lang: {
                    _text: "en_US"
                },
                "android-sdk": {
                    _text: device.androidSdk
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
                    _text: device.model
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

