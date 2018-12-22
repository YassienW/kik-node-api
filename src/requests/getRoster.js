crypto = require("../cryptoUtils")

module.exports = () => {
    let id = crypto.generateUUID()
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
                        p: "8",
                        xmlns: "jabber:iq:roster"
                    }
                }
            }
        }
    })
}
