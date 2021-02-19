# Kik Node API (Unofficial)
## Beta4.1 (Stable)
A chatting API for kik built with Node.js, based on <https://github.com/tomer8007/kik-bot-api-unofficial>

**THIS IS NOT AN OFFICIAL API**

![npm](https://img.shields.io/npm/v/kik-node-api.svg?style=plastic)
![npm](https://img.shields.io/npm/dt/kik-node-api.svg?style=plastic)

Join the group chat on kik #kiknodeapi

## Modifications
    * (new) Add iq Error Handling (All iq errors return error codes)
    * Add new Requests
    * Add new Events
    * Add stability improvements
    * Add cryptoUtils functions for calculating timestamps
    * Removed addToGroup (function already included: Kik/Add)
    * Fixed Beta1, Beta2, Beta3, Beta4 Errors
    * Updated exampleBot.js

## Installation

NPM:

```bash
npm i kik-node-api
```

## Usage

* [Getting started](#getting-started)

##### Events

1. [The Basics](#the-basics)
    * [Authenticated](#authenticated)
    * [Received Roster](#received-roster)
    * [Received Captcha](#received-captcha)
    * [Received JID Info](#received-jid-info)
2. [Group Events](#group-events)
    * [Received Group Message](#received-group-message)
    * [Received Group Image](#received-group-image)
    * [Received Group Video](#received-group-video)
    * [Received Group System Messge](#received-group-sysmsg)
    * [Received Group Stickers](#received-group-stickers)
    * [Group Is Typing](#group-is-typing)
    * [User Left Group](#user-left-group)
    * [User Joined Group](#user-joined-group)
    * [Joined Group](#joined-group)
3. [Private Events](#private-events)
    * [Received Private Friend-Search](#received-private-friend-search)
    * [Received Private Friend-Mention](#received-private-friend-mention)
    * [Received Private Message](#received-private-message)
    * [Received Private Image](#received-private-image)
    * [Received Private Video](#received-private-video)
    * [Received Private System Messge](#received-private-sysmsg)
    * [Received Private Stickers](#received-private-stickers)
    * [Private Is Typing](#private-is-typing)

##### Requests

1. [Common Requests](#common-requests)
    * [Get Roster](#get-roster)
    * [Get User Info](#get-user-info)
    * [Send Message](#send-message)
    * [Send Image](#send-image)
2. [Group Requests](#group-requests)
    * [Search Groups](#search-groups)
    * [Join Group](#join-group)
    * [Leave Group](#leave-group)
    * [Kick/Add](#kickadd)
    * [Promote/Demote](#promotedemote)
    * [Ban/Unban](#banunban)
    * [Change Group Name](#change-group-name)
3. [Profile Requests](#profile-requests)
    * [Set Profile Name](#set-profile-name)
    * [Set Email](#set-email)
    * [Set Password](#set-password)
---

## Getting Started

You can use the API by creating an instance of `KikClient`, you'll use it to listen
to events and send requests to kik

```javascript
const KikClient = require("kik-node-api");

Kik = new KikClient({
    username: "username", //your kik account's username
    password: "1234", //your kik account's password
    promptCaptchas: true,
    trackUserInfo: true,
    trackFriendInfo: true
});

Kik.connect();
```
`promptCaptchas`: prompt in the console to solve captchas. If not you must handle it yourself using the [event](#received-captcha)

`trackUserInfo`: track users and return their usernames and display names in the events when possible

`trackFriendInfo`: track friends and return their usernames and display names in the events when possible

Users Object:
```javascript
user: { 
    jid: "kikteam@talk.kik.com", 
    username: "kikteam",
    displayName: "Kik Team",
    pic: "http://profilepics.cf.kik.com/luN9IXX3a4sks-RzyiC7xlK-HdE"
}
```
Group Object:
```javascript
group: {
    jid: "1100221067977_g@groups.kik.com",
    code: "#kikbotapi", //private groups have a code of null
    name: "Kik Bot API Unofficial",
    users: [
        {jid: "jid1", isOwner: true, isAdmin: true},
        {jid: "jid2", isAdmin: true},
        {jid: "jid3"}
    ]
}
```

### Events
#### The Basics

`KikClient` uses Node's [Event Emitter](https://nodejs.org/api/events.html) class
to handle events, all events are attached in the following way:

##### Authenticated

```javascript
Kik.on("authenticated", () => {
    console.log("Authenticated");
});
```
##### Received Roster

```javascript
Kik.on("receivedroster", (groups, friends) => {
    console.log(groups);
    console.log(friends);
});
```

##### Received Captcha

```javascript
Kik.on("receivedcaptcha", (captchaUrl) => {
    console.log("Please solve captcha" + captchaUrl);
});
```

##### Received JID Info

```javascript
Kik.on("receivedjidinfo", (users) => {
    console.log("We got peer info:");
    console.log(users);
});
```

#### Group Events
##### Received Group Message

```javascript
Kik.on("receivedgroupmsg", (group, sender, msg) => {
    console.log(`Received message from ${sender.jid} in group ${group.jid}`);
});
```

##### Received Group Image

```javascript
Kik.on("receivedgroupimg", (group, sender, img) => {
    console.log(`Received image from ${sender.jid} in group ${group.jid}`)
});
```

##### Group is Typing

```javascript
Kik.on("grouptyping", (group, sender, isTyping) => {
    if(isTyping){ console.log(`${sender.jid} is typing in ${group.jid}`); }
    else{ console.log(`${sender.jid} stopped typing in ${group.jid}`); }
});
```

##### User Left Group

```javascript
Kik.on("userleftgroup", (group, user, kickedBy) => {
    console.log(`${user.jid} left the group: ${group.jid}`);
});
```

##### User Joined Group

```javascript
Kik.on("userjoinedgroup", (group, user, invitedBy) => {
    console.log(`${user.jid} joined the group: ${group.jid}`);
});
```

##### Joined Group

```javascript
Kik.on(`joinedgroup`, (group, users, sysmsg) => {
    console.log(`Joined group ${group.jid} msg ${sysmsg}`);
});
```

#### Private Events 
##### Received Private Friend-Search
```javascript
Kik.on(`receivedprivatefriendsearch`, (sender) => {
    console.log(`${sender.jid} has searched added me`);
});
```

##### Received Private Friend-Mention
```javascript
Kik.on(`receivedprivatefriendmention`, (sender) => {
    console.log(`${sender.jid} has mentioned added me`);
});
```

##### Received Private Message

```javascript
Kik.on("receivedprivatemsg", (sender, msg) => {
    console.log(`Received message from ${sender.jid}`);
});
```

##### Received Private Image

```javascript
Kik.on("receivedprivateimg", (sender, img) => {
    console.log(`Received image from ${sender.jid}`);
});
```

##### Private Is Typing

```javascript
Kik.on("privatetyping", (sender, isTyping) => {
});
```

### Requests

#### Common Requests

##### Get Roster

```javascript
Kik.getRoster((groups, friends) => {
});
```

##### Get User Info

```javascript
Kik.getUserInfo(usernamesOrJids, useXiphias, (users) => {
});
```

|                       | useXiphias = true | useXiphias = false |
| ---                   | :---:     | :---: |
| username              | ❌     | ✔️ |
| displayName           | ✔️     | ✔️ |
| profilePic            | ❌     | ✔️ |
| backgroundPic         | ✔️     | ❌ |
| registrationTimestamp | ✔️     | ❌ |
| kinId                 | ✔️     | ❌ |

##### Send Message

```javascript
Kik.sendMessage(jid, msg, (delivered, read) => {
});
```

##### Send Image

```javascript
Kik.sendImage(jid, imgPath, allowForwarding, allowSaving);
```

##### Add Friend

```javascript
Kik.addFriend(jid);
```

##### Remove Friend

```javascript
Kik.removeFriend(jid);
```

#### Group Requests

##### Search Groups

```javascript
Kik.searchGroups(searchQuery, (groups) => {
});
```

##### Join Group

```javascript
Kik.joinGroup(groupJid, groupCode, joinToken);
```

##### Leave Group

```javascript
Kik.leaveGroup(groupJid);
```

##### Kick/Add

```javascript
Kik.setGroupMember(groupJid, userJid, bool);
```

##### Promote/Demote

```javascript
Kik.setAdmin(groupJid, userJid, bool);
```

##### Ban/Unban

```javascript
Kik.setBanned(groupJid, userJid, bool);
```

##### Change Group Name

```javascript
Kik.setGroupName(groupJid, name);
```

#### Profile Requests
##### Set Profile Name

```javascript
Kik.setProfileName(firstName, lastName);
```

##### Set Email

```javascript
Kik.setEmail(newEmail, password);
```

##### Set Password

```javascript
Kik.setPassword(newPassword, oldPassword);
```

## License
[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
