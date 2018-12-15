module.exports = (data, client) => {
    //data here is a JSSoup element i can directly consume data from
    if(data.find("k")){
        if(data.find("k").attrs.ts){
            client.emit("authenticated")
            client.getRoster()
        }else{
            client.getNode()
        }
    }else if(data.find("query")){
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
    }else if(data.find("message")){
        let type = data.find("message").attrs.type

        if(type === "groupchat"){
        /*{
                jid: data.find("g").attrs.jid,
                 code: (client.groups.find(jid)),
                name: (),
            }*/
            let group = client.groups.find((group) => {return group.jid === data.find("g").attrs.jid})
            let user = client.users.find((user) => {return user.jid === data.find("message").attrs.from})

            if(data.find("body")){
                client.emit("receivedgroupmsg", group, user, data.find("body").text)
            }else if(data.find("is-typing")){
                client.emit("grouptyping", group, user, data.find("is-typing").attrs.val === "true")
            }else if(data.find("status")){
                let status = data.find("status")

                if(status.text.includes("left") || status.text.includes("removed")){
                    user = client.users.find((user) => {return user.jid === status.attrs.jid})
                    let kickedBy = (status.text.includes("removed")? status.text.split("has")[0].trim() : null)

                    client.emit("userleftgroup", group, user, kickedBy)
                }else if(status.text.includes("joined")){
                    client.getJidInfo(data.find("status").attrs.jid)

                    //i can't return user info since i have to recieve the getJidInfo response first for a user that just joined,
                    //return the JID until i find a way
                    client.emit("userjoinedgroup", group, data.find("status").attrs.jid, null)
                }
            }
        }else if(type === "chat"){
            if(data.find("xiphias-mobileremote-call")){
                //safetynet message
            }else{
                let user = client.friends.find((friend) => {return friend.jid === data.find("message").attrs.from})
                client.emit("receivedprivatemsg", user, data.find("body").text)
            }
        }else if(type === "is-typing"){
            let user = client.friends.find((friend) => {return friend.jid === data.find("message").attrs.from})
            client.emit("privateTyping", user, data.find("is-typing").attrs.val === "true")
        }
    }else{
        console.log("Unhandled")
    }
}
