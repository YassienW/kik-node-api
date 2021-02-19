const crypto = require("../../utility/cryptoUtils");

module.exports = (searchQuery) => {
    const id = crypto.generateUUID();
    const parsedSearchQuery = Buffer.from("\x0a" + String.fromCharCode(searchQuery.length) + searchQuery)
        .toString("base64");
    return({
        id,
        xml: {
            iq: {
                _attributes: {
                    type: "set",
                    id
                },
                query: {
                    _attributes: {
                        xmlns: "kik:iq:xiphias:bridge",
                        service: "mobile.groups.v1.GroupSearch",
                        method: "FindGroups"
                    },
                    body: {
                        _text : parsedSearchQuery.endsWith("=")?
                            parsedSearchQuery.slice(0, parsedSearchQuery.indexOf("=")): parsedSearchQuery
                    }
                }
            }
        }
    });
};

