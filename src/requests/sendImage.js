const crypto = require("../cryptoUtils"),
    path = require("path"),
    fs = require("fs");

module.exports = (jid, imgPath, isGroup, allowForwarding = true) => {
    const timestamp = new Date().getTime(), id = crypto.generateUUID(), contentId = crypto.generateUUID();
    const type = (isGroup? "groupchat" : "chat");
    const buff = fs.readFileSync(imgPath);

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
                        id: contentId,
                        v: "2",
                        "app-id": "com.kik.ext.gallery"
                    },
                    strings: {
                        "app-name": {
                            _text: "Gallery"
                        },
                        "file-size": {
                            _text: buff.byteLength
                        },
                        "allow-forward": {
                            _text: allowForwarding
                        },
                        "file-name": {
                            _text: path.basename(imgPath)
                        }
                    },
                    images: {
                        preview: {
                            _text: buff.toString("base64")
                        }
                    }
                }
            }
        }
    });
};
