const config = require("../config"),
    crypto = require("../cryptoUtils");

module.exports = (username, password, node, deviceID, version) => {
    let timestamp = "1496333389122";
    let sid = crypto.generateUUID();
    let jid = `${node}@talk.kik.com`;
    console.log(config(version).kikVersionInfo.version);
    return({
        k: {
            _attributes: crypto.sortPayload({
                n: "1",
                conn: "WIFI",
                sid: sid,
                signed: crypto.generateSignature(config(version).kikVersionInfo.version, timestamp, jid, sid),
                to: "talk.kik.com",
                v: config(version).kikVersionInfo.version,
                lang: "en_US",
                ts: timestamp,
                from: `${jid}/CAN${deviceID}`,
                p: crypto.generatePasskey(username, password),
                cv: crypto.generateCV(config(version).kikVersionInfo, timestamp, jid)
            })
        }
    });
};

