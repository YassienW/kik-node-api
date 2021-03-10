const config = require("../config"),
    crypto = require("../cryptoUtils");

module.exports = (username, password, deviceID, androidID, captchaResponse) => {

    let loginNode = ({
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
                    _text: new Date().getTime() - 15000 - Math.floor(Math.random() * 30000) + 1
                },
                "device-type": {
                    _text: "android"
                },
                brand: {
                    _text: "generic"
                },
                "logins-since-install": {
                    _text: "0"
                },
                version: {
                    _text: config.kikVersionInfo.version
                },
                lang: {
                    _text: "en_US"
                },
                "android-sdk": {
                    _text: "19"
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
                    _text: "Samsung Galaxy S5 - 4.4.4 - API 19 - 1080x1920"
                }
            }
        }
    });

    if (captchaResponse !== undefined) {	
        let captchaField = {
            challenge: {
                response: {
                    _text: captchaResponse
                }
            }
        }
        Object.assign(loginNode, captchaField);
	}
	
	return loginNode;
};

