const KikClient = require("./src/kikClient")

Kik = new KikClient({
    username: "username",
    password: "1234",
    kikNode: null,
    trackGroupInfo: true,
    trackUserInfo: true,
    trackFriendInfo: true
})
Kik.on("authenticated", () => {
    //this is not needed since the client grabs roster automatically once authenticated
/*    Kik.getRoster((groups, friends) => {
        console.log("We got the roster")
        console.log(groups)
        console.log(friends)
    })*/
})
//alternatively you can use this event for roster
Kik.on("receivedroster", (groups, friends) => {
    //do stuff here
})
Kik.on("receivedjidinfo", (users) => {
    console.log("We got peer info")
})
//group events
Kik.on("receivedgroupmsg", (group, sender, msg) => {
    Kik.getJidInfo(sender.jid, (users) => {
        console.log("Received JID info")
        console.log(users)
    })
    console.log(`GROUP:${group.code}: [${sender.displayName}]: ${msg}`)
    Kik.sendGroupMessage(group.jid, msg, (delivered, read) => {
        if(delivered){
            console.log("groupdelivered" + delivered)
        }else if(read){
            console.log("groupread" + read)
        }
    })
})
Kik.on("grouptyping", (group, sender, isTyping) => {
    if(isTyping){
        console.log(`GROUP:${group.code}: ${sender.displayName} is typing...`)
    }else{
        console.log(`GROUP:${group.code}: ${sender.displayName} stopped typing`)
    }
})
Kik.on("userleftgroup", (group, user, kickedBy) => {
    console.log(`GROUP:${group.code}: ${user.displayName} left the group`)
})
Kik.on("userjoinedgroup", (group, user, invitedBy) => {
    console.log(`GROUP:${group.code}: ${user} joined the group`)
})
//private messaging events
Kik.on("receivedprivatemsg", (sender, msg) => {
    Kik.sendPrivateMessage(sender.jid, msg, (delivered, read) => {
        if(delivered){
            console.log("pmdelivered" + delivered)
        }else if(read){
            console.log("pmread" + read)
        }
    })
    console.log(`PRIVATE: [${sender.displayName}]: ${msg}`)
})

Kik.connect()

