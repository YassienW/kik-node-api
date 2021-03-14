const crypto = require("../helpers/cryptoUtils");

module.exports = (jid, image, isGroup, allowForwarding = true, allowSaving = true) => {
    const timestamp = new Date().getTime(), id = crypto.generateUUID();
    const type = (isGroup? "groupchat" : "chat");

    return({
        id: id,
        xml: {
            message: {
                _attributes: {
                    xmlns: "jabber:client",
                    type: type,
                    to: jid,
                    id: id,
                    cts: timestamp
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
                        "app-id": "com.kik.ext.gallery"
                    },
                    strings: {
                        "app-name": {
                            _text: "Gallery"
                        },
                        "file-size": {
                            _text: image.size
                        },
                        "allow-forward": {
                            _text: allowForwarding
                        },
                        "disallow-save": {
                            _text: !allowSaving
                        },
                        "file-content-type": {
                            _text: "image/jpeg"
                        },
                        "file-name": {
                            _text: `${image.contentId}.jpg`
                        }
                    },
                    hashes: {
                        "sha1-original": {
                            _text: image.sha1
                        },
                        "sha1-scaled": {
                            _text: image.previewSha1
                        },
                        "blockhash-scaled": {
                            _text: image.previewBlockhash
                        }
                    },
                    images: {
                        preview: {
                            _text: image.previewBase64
                        }
                    }
                }
            }
        }
    });
};
