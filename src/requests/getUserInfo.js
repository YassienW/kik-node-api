const crypto = require("../cryptoUtils");

//array of jids/usernames, or one jid/username string
module.exports = (usernamesOrJids) => {
    const id = crypto.generateUUID();
    if(!Array.isArray(usernamesOrJids)){
        usernamesOrJids = [usernamesOrJids];
    }
    const items = usernamesOrJids.map((usernameOrJid) => ({
        "_attributes": {
            [usernameOrJid.includes("@")? "jid" : "username"]: usernameOrJid
        }
    }));
    return({
        id: id,
        xml: {
            iq: {
                _attributes: {
                    type: "get",
                    id: id
                },
                query: {
                    _attributes: {
                        xmlns: items.length > 1? "kik:iq:friend:batch" : "kik:iq:friend"
                    },
                    item: items
                }
            }
        }
    });
};
