crypto = require("../cryptoUtils")

//array of jids, or one jid string
module.exports = (jids) => {
    let items = []
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
        iq: {
            _attributes: {
                type: "get",
                id: crypto.generateUUID(),
            },
            query: {
                _attributes: {
                    xmlns: "kik:iq:friend:batch"
                },
                item: items
            },
        }
    })
}
