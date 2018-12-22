module.exports = (client, callbacks, id, data) => {
    let type = data.find("message").attrs.type

    if(type === "groupchat"){
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
}
