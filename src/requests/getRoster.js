crypto = require("../cryptoUtils")

module.exports = () => {
    return({
        iq: {
            _attributes: {
                type: "get",
                id: crypto.generateUUID(),
            },
            query: {
                _attributes: {
                    p: "8",
                    xmlns: "jabber:iq:roster"
                }
            },
        }
    })
}
