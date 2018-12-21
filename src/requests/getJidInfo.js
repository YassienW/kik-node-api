crypto = require("../cryptoUtils")

//array of jids, or one jid string
module.exports = (jids) => {
    let items = [], id = crypto.generateUUID()
    if(Array.isArray(jids)){
        jids.forEach((jid) => {
            items.push({
                "_attributes": {
                    jid: jid
                }
            })
        })
    }else{
        items = [jids]
    }
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
                        xmlns: "kik:iq:friend:batch"
                    },
                    item: items
                }
            }
        }
    })
}
