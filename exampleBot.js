const KikClient = require("kik-node-api");

const Kik = new KikClient({
    username: "username",
    password: "1234",
    promptCaptchas: true,
    trackUserInfo: true,
    trackFriendInfo: true
});
Kik.on("authenticated", () => {
    //this is not needed since the client grabs roster automatically once authenticated
/*    Kik.getRoster((groups, friends) => {
        console.log("We got the roster")
        console.log(groups)
        console.log(friends)
    })*/
});
//alternatively you can use this event for roster
Kik.on("receivedroster", (groups, friends) => {
    console.log(groups);
    console.log(friends)
});
//alternatively you can use this event for captcha
Kik.on("receivedcaptcha", (captchaUrl) => {
    console.log("Please solve captcha" + captchaUrl)
});
Kik.on("receivedjidinfo", (users) => {
    console.log("We got peer info:");
    console.log(users)
});

/*GROUP EVENTS*/
Kik.on("receivedgroupmsg", (group, sender, msg) => {
    console.log(`GROUP:${group.code}: [${sender.displayName}]: ${msg}`)
});
Kik.on("grouptyping", (group, sender, isTyping) => {
    if(isTyping){
        console.log(`GROUP:${group.code}: ${sender.displayName} is typing...`)
    }else{
        console.log(`GROUP:${group.code}: ${sender.displayName} stopped typing`)
    }
});
Kik.on("userleftgroup", (group, user, kickedBy) => {
    console.log(`GROUP:${group.code}: ${user.displayName} left the group`);
    //ban anyone once they leave
    Kik.setBanned(group.jid, user.jid, true)
});
Kik.on("userjoinedgroup", (group, user, invitedBy) => {
    console.log(`GROUP:${group.code}: ${user.displayName} joined the group`);
    //kicking anyone once they join
    Kik.setGroupMember(group.jid, user.jid, false)
});
Kik.on("receivedgroupsysmsg", (group, sender, sysmsg) => {
    console.log(`recived sysmsg from ${sender.jid} msg ${sysmsg}`);
});
Kik.on(`joinedgroup`, (group, users, msg) => {
    console.log(`Joined group ${group.jid} msg ${msg}`);
});
    

/*PRIVATE EVENTS*/
Kik.on(`receivedprivatefriendsearch`, (sender) => {
    console.log(`${sender.jid} has searched added me`);
});
Kik.on(`receivedprivatefriendmention`, (sender) => {
    console.log(`${sender.jid} has mentioned added me`);
});
Kik.on("receivedprivatemsg", async (sender, msg) => {
    await Kik.sendImage(sender.jid, "path/to/img.png", false, false);
    Kik.sendMessage(sender.jid, msg, (delivered, read) => {
        if(delivered){
            console.log(`PRIVATE: ${sender.jid} PM read`)
        }else if(read){
            console.log(`PRIVATE: ${sender.jid} PM delivered`)
        }
    });
    console.log(`PRIVATE: [${sender.displayName}]: ${msg}`)
});
Kik.on("privatetyping", (sender, isTyping) => {
    if(isTyping){
        console.log(`PRIVATE: ${sender.jid} is typing`)
    }else{
        console.log(`PRIVATE: ${sender.jid} stopped typing`)
    }
});

Kik.connect();

