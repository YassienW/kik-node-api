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
    console.log("Authenticated boi")
})
Kik.on("receivedroster", (groups, friends) => {
    console.log("We got the roster")
    console.log(groups)
    console.log(friends)
})
Kik.on("receivedjidinfo", (users) => {
    console.log("We got peer info")
})

//group events
Kik.on("receivedgroupmsg", (group, sender, msg) => {
    console.log(`GROUP:${group.code}: [${sender.displayName}]: ${msg}`)
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
    console.log(`PRIVATE: [${sender.displayName}]: ${msg}`)
})

Kik.connect()

