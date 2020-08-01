const crypto = require("../cryptoUtils");

module.exports = (jid, image, allowForwarding = true, isGroup) => {
    const timestamp = new Date().getTime(), id = crypto.generateUUID();
    const type = (isGroup? "groupchat" : "chat");

    return({
        id: id,
        xml: {
            message: {
                _attributes: {
                    type: type,
                    to: jid,
                    id: id,
                },
                kik: {
                    _attributes: {
                        push: "true",
                        qos: "true",
                        timestamp: timestamp
                    }
                },
                request: {
                    _attributes: {
                        //xmlns: "kik:message:receipt",
                        r: "true",
                        d: "true"
                    }
                },
                content: {
                    _attributes: {
                        id: image.contentId,
                        v: "2",
                        "app-id": "com.kik.ext.stickers"
                    },
                    strings: {
                        "app-name": {
                            _text: "Stickers"
                        },
                        "layout": {
                            _text: "photo"
                        },
                        "allow-forward": {
                            _text: allowForwarding
                        }
                    },
                    extras: {
                        "key": "sticker_id",
                        "val": 6680408046960640
                    },
                    hashes: {},
                    images: {
                        "png-preview": {
                            _text: image.previewBase64
                        }
                    }
                }
            }
        }

    });


};
