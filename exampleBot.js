const KikClient = require("kik-node-api");

const Kik = new KikClient({
    username: "username",
    password: "1234",
    promptCaptchas: true,
    trackUserInfo: true,
    trackFriendInfo: true
});
Kik.on("authenticated", () => {
});
//alternatively you can use this event for roster
Kik.on("receivedroster", (groups, friends) => {
});
//alternatively you can use this event for captcha
Kik.on("receivedcaptcha", (captchaUrl) => {
    console.log("Please solve captcha: " + captchaUrl);
});
Kik.on("receivedjidinfo", (users) => {
});

//[GROUP]
Kik.on(`receivedgroupmsg`, (group, sender, msg) => {
});
Kik.on("receivedgroupimg", (group, sender, img) => {
});
Kik.on("receivedgroupvid", (group, sender, vid) => {
});
Kik.on("receivedgroupgif", (group, sender, gif) => {
});
Kik.on("receivedgroupsticker", (group, sender, sticker) => {
});
Kik.on("receivedgroupsysmsg", (group, sender, sysmsg) => {
});
Kik.on(`receivedgrouptyping`, (group, sender, isTyping) => {
});
Kik.on(`userleftgroup`, (group, sender, kickedBy) => {
});
Kik.on(`userjoinedgroup`, (group, sender, invitedBy) => {
});
Kik.on(`joinedgroup`, (group, users, msg) => {
});

//[PRIVATE]
Kik.on(`receivedprivatefriendsearch`, (sender) => {
});
Kik.on(`receivedprivatefriendmention`, (sender) => {
});
Kik.on(`receivedprivatemsg`, (sender, msg) => {
});
Kik.on("receivedprivateimg", (sender, img) => {
});
Kik.on("receivedprivatevid", (sender, vid) => {
});
Kik.on("receivedprivategif", (sender, gif) => {
});
Kik.on("receivedprivatesticker", (sender, sticker) => {
});
Kik.on("receivedprivatesysmsg", (sender, sysmsg) => {
});
Kik.on(`receivedprivatetyping`, (sender, isTyping) => {
});

Kik.connect();