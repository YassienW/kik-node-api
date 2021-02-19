const crypto = require("../../utility/cryptoUtils"),
    protobuf = require("../../protobuf/protobufParser");

//array of jids
module.exports = (jids) => {
    const id = crypto.generateUUID();
    //check the first item to determine if the inputs are alias or not
    const isAlias = jids[0].split("@")[0].endsWith("_a");

    const message = protobuf.lookupType(isAlias? "GetUsersByAliasRequest": "GetUsersRequest")
        .create({ ids: jids.map((jid) => {
            const localPart = jid.split("@")[0];
            return isAlias? {aliasJid: {localPart}}: {localPart};
        })});

    return({
        id: id,
        xml: {
            iq: {
                _attributes: {
                    type: "set",
                    id: id
                },
                query: {
                    _attributes: {
                        xmlns: "kik:iq:xiphias:bridge",
                        service: "mobile.entity.v1.Entity",
                        method: isAlias ? "GetUsersByAlias" : "GetUsers"
                    },
                    body: {
                        _text: protobuf.lookupType(isAlias? "GetUsersByAliasRequest": "GetUsersRequest")
                            .encode(message).finish().toString("base64")
                    }
                }
            }
        }
    });
};
