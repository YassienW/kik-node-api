const config = require("../config"),
    crypto = require("../helpers/cryptoUtils");

module.exports = (deviceID) => {
    let timestamp = "1496333389122";
    let sid = crypto.generateUUID();
    return({
        k: {
            _attributes: crypto.sortPayload({
                conn: "WIFI",
                sid: sid,
                anon: "1",
                signed: crypto.generateSignature(config.kikVersionInfo.version, timestamp, `CAN${deviceID}`, sid),
                v: config.kikVersionInfo.version,
                lang: "en_US",
                ts: timestamp,
                dev: `CAN${deviceID}`,
                cv: "cv"
            })
        }
    });
};

