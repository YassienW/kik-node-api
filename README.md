# Kik Node API

A chatting API for kik built with Node.js, based on <https://github.com/tomer8007/kik-bot-api-unofficial>

**THIS IS NOT AN OFFICIAL API**

![npm](https://img.shields.io/npm/v/kik-node-api.svg?style=plastic)
![npm](https://img.shields.io/npm/dt/kik-node-api.svg?style=plastic)

Join the group chat on kik #kiknodeapi

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
    * [Group Is Typing](#group-is-typing)
    * [User Left Group](#user-left-group)
    * [User Joined Group](#user-joined-group)
3. [Private Events](#private-events)
    * [Received Private Message](#received-private-message)
    * [Received Private Image](#received-private-image)
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

### Getting Started

You can use the API by creating an instance of `KikClient`, you'll use it to listen
to events and send requests to kik

```javascript
const KikClient = require("kik-node-api");

Kik = new KikClient({
    username: "username",
    password: "1234",
    promptCaptchas: true,
});

Kik.connect()
```
`username`: your kik account's username 

`password`: your kik account's password

`promptCaptchas`: prompt in the console to solve captchas. If not you must handle it yourself using the [event](#received-captcha)

The user object:

```
user: { 
    jid: "kikteam@talk.kik.com", 
    username: "kikteam",
    displayName: "Kik Team",
    pic: "http://profilepics.cf.kik.com/luN9IXX3a4sks-RzyiC7xlK-HdE"
}
```
The group object
```
group: {
    jid: "1100221067977_g@groups.kik.com",
    code: "#kikbotapi",
    name: "Kik Bot API Unofficial",
    users: [
        {jid: "jid1", isOwner: true, isAdmin: true},
        {jid: "jid2", isAdmin: true},
        {jid: "jid3"}
    ]
}
```
private groups have a code of null

### Events
#### The Basics

`KikClient` uses Node's [Event Emitter](https://nodejs.org/api/events.html) class
to handle events, all events are attached in the following way:

```javascript
Kik.on(eventname, (param1, param2) => {
    //do stuff with params here
})
```

Below are the details of all events emitted by the `KikClient` class

##### Authenticated

```javascript
Kik.on("authenticated", () => {
    console.log("Authenticated")
})
```
##### Received Roster

```javascript
Kik.on("receivedroster", (groups, friends) => {
    console.log(groups);
    console.log(friends)
})
```
`groups`: an array of [`group`](#getting-started) objects representing the groups you are in

`friends`: an array of [`user`](#getting-started) objects, each representing a friend

##### Received Captcha

```javascript
Kik.on("receivedcaptcha", (captchaUrl) => {
    console.log("Please solve captcha" + captchaUrl)
})
```
`captchaUrl`: url to the captcha page

##### Received JID Info

```javascript
Kik.on("receivedjidinfo", (users) => {
    console.log("We got peer info:");
    console.log(users)
})
```
`users`: an array of [`user`](#getting-started) objects returned as a result of requesting jids

#### Group Events
##### Received Group Message

```javascript
Kik.on("receivedgroupmsg", (groupJid, senderJid, msg) => {
    console.log(`Received message from ${senderJid} in group ${groupJid}`)
})
```


##### Received Group Image

```javascript
Kik.on("receivedgroupimg", (groupJid, senderJid, img) => {
    console.log(`Received image from ${sender.jid} in group ${group.jid}`)
})
```
`img`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the image

##### Group is Typing

```javascript
Kik.on("grouptyping", (groupJid, senderJid, isTyping) => {
    if(isTyping){
        console.log(`${senderJid} is typing in ${groupJid}`)
    }else{
        console.log(`${senderJid} stopped typing in ${groupJid}`)
    }
})
```
`isTyping`: true if the user is typing, false if they stopped

##### User Left Group

```javascript
Kik.on("userleftgroup", (groupJid, userJid, wasKicked) => {
    console.log(`${userJid} left the group: ${groupJid}`)
})
```
`wasKicked`: `true` if the user was kicked

##### User Joined Group

```javascript
Kik.on("userjoinedgroup", (groupJid, userJid, wasInvited) => {
    console.log(`${userJid} joined the group: ${groupJid}`)
})
```

`wasInvited`: `true` if the user was invited

#### Private Events 
##### Received Private Message

```javascript
Kik.on("receivedprivatemsg", (senderJid, msg) => {
    console.log(`Received message from ${senderJid}`)
})
```
`msg`: the received message

##### Received Private Image

```javascript
Kik.on("receivedprivateimg", (senderJid, img) => {
    console.log(`Received image from ${senderJid}`)
})
```

`img`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the image

##### Private Is Typing

```javascript
Kik.on("privatetyping", (senderJid, isTyping) => {
    if(isTyping){
        console.log(`${senderJid} is typing`)
    }else{
        console.log(`${senderJid} stopped typing`)
    }
})
```
`isTyping`: true if the user is typing, false if he stopped

### Requests

Note that all callback functions can be excluded

#### Common Requests

##### Get Roster

```javascript
Kik.getRoster((groups, friends) => {
    
});
```

See [received roster](#received-roster) for response information

##### Get User Info

This function can be used to search users by username

```javascript
Kik.getUserInfo(usernamesOrJids, useXiphias, (users) => {
    
});
```

`usernamesOrJids`: a single username or a single jid string.
Also accepts an array of jid strings or username strings

`useXiphias`: if true will use the xiphias endpoint. 
This endpoint accepts jids only and returns different data

|                       | useXiphias = true | useXiphias = false |
| ---                   | :---:     | :---: |
| username              | ❌     | ✔️ |
| displayName           | ✔️     | ✔️ |
| profilePic            | ❌     | ✔️ |
| backgroundPic         | ✔️     | ❌ |
| registrationTimestamp | ✔️     | ❌ |
| kinId                 | ✔️     | ❌ |

note that some data will only be returned if you're chatting with a user

returns an array of [`user`](#getting-started) objects,
or an empty array if no results are found

##### Send Message

You can provide a group's or a user's jid, they will automatically use
the appropriate format

```javascript
Kik.sendMessage(jid, msg, (delivered, read) => {
    if(delivered){
        console.log("Delivered")
    }else if(read){
        console.log("Read")
    }
})
```

##### Send Image

You can provide a group's or a user's jid, they will automatically use
the appropriate format

```javascript
Kik.sendImage(jid, imgPath, allowForwarding, allowSaving)
```

`allowForwarding`: boolean, if false this image will not give the 
receiver a forwarding option. true by default

`allowSaving`: boolean, if false this image will not give the 
receiver a download option. true by default

returns a promise, make sure to use this inside an async function with the await keyword

##### Add Friend

```javascript
Kik.addFriend(jid)
```

##### Remove Friend

```javascript
Kik.removeFriend(jid)
```

#### Group Requests

##### Search Groups

```javascript
Kik.searchGroups(searchQuery, (groups) => {
    
})
```
`groups`: an array of [`group`](#getting-started) objects representing the search results, 
the group objects here have a special `joinToken` variable used for
joining the group

##### Join Group

```javascript
Kik.joinGroup(groupJid, groupCode, joinToken)
```

##### Leave Group

```javascript
Kik.leaveGroup(groupJid)
```

##### Kick/Add

```javascript
Kik.setGroupMember(groupJid, userJid, bool)
```

##### Promote/Demote

```javascript
Kik.setAdmin(groupJid, userJid, bool)
```

##### Ban/Unban

```javascript
Kik.setBanned(groupJid, userJid, bool)
```

##### Change Group Name

```javascript
Kik.setGroupName(groupJid, name)
```

#### Profile Requests
##### Set Profile Name

```javascript
Kik.setProfileName(firstName, lastName)
```

##### Set Email

```javascript
Kik.setEmail(newEmail, password)
```

##### Set Password

```javascript
Kik.setPassword(newPassword, oldPassword)
```

## License
[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
