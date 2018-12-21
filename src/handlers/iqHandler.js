module.exports = (client, id, data) => {
    let xmlns = data.find("query").attrs.xmlns

    if(xmlns === "jabber:iq:register"){
        client.params.kikNode = data.find("node").text
        //we have to disconnect first, then initiate a new connection, with the node set this time
        client.connection.disconnect()
        client.connect()

    }else if(xmlns === "jabber:iq:roster"){
        let groups = [], friends = []
        data.findAll("item").forEach((friend) => {
            friends.push({
                jid: friend.attrs.jid,
                username: friend.find("username").text,
                displayName: friend.find("display-name").text
            })
        })
        data.findAll("g").forEach((group) => {
            let users = []
            group.findAll("m").forEach((user) => {
                users.push(user.text)
            })
            groups.push({
                jid: group.attrs.jid,
                code: group.find("code").text,
                name: group.find("n").text,
                users: users
            })
        })
        client.emit("receivedroster", groups, friends)
/*        if(this.callbacks.has(id)){
            console.log(this.callbacks)
            this.callbacks.get(id)(groups, friends);
            this.callbacks.delete(id)
            console.log(this.callbacks)
        }*/
    }else if(xmlns === "kik:iq:friend:batch"){
        let users = []
        data.findAll("item").forEach((user) => {
            users.push({
                jid: user.attrs.jid,
                username: user.find("username").text === "Username unavailable"? null : user.find("username").text,
                displayName: user.find("display-name").text,
                //sometimes, when you are the user there is no pic (maybe there are other cases idk)
                pic: user.find("pic") ? user.find("pic").text : null
            })
        })
        client.emit("receivedjidinfo", users)
    }
}
