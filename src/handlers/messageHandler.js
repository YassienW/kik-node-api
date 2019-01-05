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
        }else if(data.find("images")){
            client.emit("receivedgroupimg", group, user, client.imgManager.getImg(data.find("file-url").text, false))
        }
    }else if(type === "chat" || type === "is-typing"){
        let jid = data.find("message").attrs.from

        let user = {jid: jid, username: null, displayName: null}
        if(client.params.trackFriendInfo /*|| client.params.trackUserInfo*/){
            //try to find the user data in friends first
            let userSearch = client.friends.find(friend => {return friend.jid === jid})
            user = (userSearch? userSearch : user)

            /*if(!user){
                  //try to find the user data in users
                  user = client.users.find(user => {return user.jid === jid})
                  //if we don't find the user in users, and user tracking is on, get his jid info (this automatically
                  //adds him//to users), otherwise we return what we found
                  if(!user && client.params.trackUserInfo){
                      client.getJidInfo(data.find("message").attrs.from, (users) => {
                          client.emit("receivedprivatemsg", users[0], data.find("body").text)
                      })
                  }else{
                      client.emit("receivedprivatemsg", user, data.find("body").text)
                  }
              }else{
                  client.emit("receivedprivatemsg", user, data.find("body").text)
              }*/
        }

        if(data.find("xiphias-mobileremote-call")){
            //safetynet message
        }else if(data.find("body")){
            client.emit("receivedprivatemsg", user, data.find("body").text)
        }else if(type === "is-typing"){
            client.emit("privatetyping", user, data.find("is-typing").attrs.val === "true")
        }else if(data.find("images")){
            client.emit("receivedprivateimg", user, client.imgManager.getImg(data.find("file-url").text, true))
        }
    }else if(type === "receipt"){
        let receipt = data.find("receipt").attrs.type

        data.findAll("msgid").forEach(msgid => {
            let callback = callbacks.get(msgid.attrs.id)
            if(callback){
                //only delete the callback function when you get the read receipt, this WILL cause a leak if a client
                //doesn't return read receipts for any reason
                if(receipt === "delivered"){
                    callback(true, false);
                }else if(receipt === "read"){
                    callback(false, true);
                    callbacks.delete(msgid.attrs.id)
                }
            }
        })
    }
}
