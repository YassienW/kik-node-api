const crypto = require("../cryptoUtils");

module.exports = (jid, video, isGroup, allowForwarding = true, allowSaving = true, autoPlay = true, loop = true) => {
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
                        id: video.contentId,
                        v: "2",
                        "app-id": "com.kik.ext.gallery"
                    },
                    strings: {
                        "app-name": {
                            _text: "Gallery"
                        },
                        "file-size": {
                            _text: video.size
                        },
                        "layout": {
                            _text: "video"
                        },
                        "duration": {
                            _text: ""
                        },
                        "allow-forward": {
                            _text: allowForwarding
                        },
                        "video-should-autoplay": {
                            _text: autoPlay
                        },
                        "video-should-loop": {
                            _text: loop
                        },
                        "disallow-save": {
                            _text: !allowSaving
                        },
                        "file-content-type": {
                            _text: "video/mp4"
                        },
                        "file-name": {
                            _text: `${video.contentId}.mp4`
                        },
                        // "file-url": {
                        //     _text: video.respUrl
                        // }
                    },
                    extras: {
                        "key": "needstranscoding",
                        "val": "false"
                    },
                    hashes: {
                        "sha1-original": {
                            _text: video.sha1
                        },
                        "sha1-scaled": {
                            _text: video.previewSha1
                        },
                        "blockhash-scaled": {
                            _text: video.previewBlockhash
                        }
                    },
                    images: {
                        preview: {
                            _text: video.previewBase64
                        }
                    }
                }
            }
        }
    });
};