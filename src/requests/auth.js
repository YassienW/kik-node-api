const config = require("../config"),
    crypto = require("../cryptoUtils")

module.exports = (username, password, node, deviceID) => {
    let timestamp = "1496333389122"
    let sid = crypto.generateUUID()
    let jid = `${node}@talk.kik.com`
    return({
        k: {
            _attributes: crypto.sortPayload({
                n: "1",
                conn: "WIFI",
                sid: sid,
                signed: crypto.generateSignature(config.kikVersionInfo.version, timestamp, jid, sid),
                to: "talk.kik.com",
                v: config.kikVersionInfo.version,
                lang: "en_US",
                ts: timestamp,
                from: `${jid}/CAN${deviceID}`,
                p: crypto.generatePasskey(username, password),
                cv: crypto.generateCV(config.kikVersionInfo, timestamp, jid)
            })
        }
    })
}

