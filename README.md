# Kik Node API

A chatting API for kik built with Node.js, based on <https://github.com/tomer8007/kik-bot-api-unofficial>

**THIS IS NOT AN OFFICIAL API**

![npm](https://img.shields.io/npm/v/kik-node-api.svg?style=plastic)
![npm](https://img.shields.io/npm/dt/kik-node-api.svg?style=plastic)

**Modificcations**

1. Removed dependency on native module sharp allowing for use in containers such as glitch.com
2. ~~Lazy~~ slightly improved fix for crash caused by groups not providing username ".text"
3. Coincidentally added the ability to load images directly from URLs in the process of removing dependency on sharp.
4. Added kik version changer, review [config.js](./src/config.js) to see exact versions
5. Added support for sending and receiving stickers, with help from Vilppu on kik.
6. Added support for sending and receiving system messages.
6. Added support for sending and receiving videos(gifs)
7. Fixed 2 packet limitation in [kikConnection.js](./src/kikConnection.js)

**To Do's**
1. Add change profile picture and background functionality
2. Official kikbots reply options menu support.

## Installation
This module is far from production ready please use the original modules that his on NPM: kik-node-api as shown below

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
    * [Received Group System Message](#received-group-system-message)
    * [Received Group Image](#received-group-image)
    * [Received Group Sticker](#received-group-sticker)
    * [Group Is Typing](#group-is-typing)
    * [User Left Group](#user-left-group)
    * [User Joined Group](#user-joined-group)
3. [Private Events](#private-events)
    * [Received Private Message](#received-private-message)
    * [Received Private System Message](#received-private-system-message)
    * [Received Private Image](#received-private-image)
    * [Received Private Sticker](#received-private-sticker)
    * [Received Private Video](#received-private-video)
    * [Received Private Gif](#received-private-gif)
    * [Private Is Typing](#private-is-typing)

##### Requests

1. [Common Requests](#common-requests)
    * [Send Message](#send-message)
    * [Send Image](#send-image)
    * [Send Video](#send-video)
    * [Send Sticker](#send-sticker)
2. [Group Requests](#group-requests)
    * [Kick/Add](#kickadd)
    * [Promote/Demote](#promotedemote)
    * [Ban/Unban](#banunban)
    * [Change Group Name](#change-group-name)
3. [Private Requests](#private-requests)
    * [Set Profile Name](#set-profile-name)
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
    trackUserInfo: true,
    trackFriendInfo: true,
    version: 15
});

Kik.connect()
```
`username`: your kik account's username 

`password`: your kik account's password

`promptCaptchas`: prompt in the console to solve captchas. If not you must handle it yourself using the [event](#received-captcha)

`trackUserInfo`: track users and return their usernames and display names in the events when possible

`trackFriendInfo`: track friends and return their usernames and display names in the events when possible

`version`: sets the kik version and corresponding sha1Digest options 14, 14.5, 15.25 if not included defaults to 15.25

All users are represented in a js object that looks like this:
```
user: { 
    jid: "kikteam@talk.kik.com", 
    username: "kikteam",
    displayName: "Kik Team",
    pic: "http://profilepics.cf.kik.com/luN9IXX3a4sks-RzyiC7xlK-HdE"
}
```
groups are represented in the following js object:
```
group: { 
    jid: "1100221067977_g@groups.kik.com", 
    code: "#kikbotapi",
    name: "Kik Bot API Unofficial",
    users: ["jid1", "jid2", "jid3"]
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
Kik.on("receivedgroupmsg", (group, sender, msg) => {
    console.log(`Received message from ${sender.jid} in group ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender

`msg`: the received message

##### Received Group System Message

```javascript
Kik.on("receivedgroupsysmsg", (group, sender, sysmsg) => {
    console.log(`Received system message from ${sender.jid} in group ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender, included sended becausse modded users can spoof system messages

`sysmsg`: the received system message

##### Received Group Image

```javascript
Kik.on("receivedgroupimg", (group, sender, img) => {
    console.log(`Received image from ${sender.jid} in group ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender

`img`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the image

##### Received Group Sticker

```javascript
Kik.on("receivedgroupsticker", (group, sender, sticker) => {
    console.log(`Received Sticker from ${sender.jid} in group ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender

`sticker`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the image

##### Received Group Video

```javascript
Kik.on("receivedgroupvid", (group, sender, vid) => {
    console.log(`Received Video from ${sender.jid} in group ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender

`vid`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the video

##### Received Group Gif

```javascript
Kik.on("receivedgroupgif", (group, sender, gif) => {
    console.log(`Received Gif from ${sender.jid} in group ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender

`gif`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the gif video

##### Group is Typing

```javascript
Kik.on("grouptyping", (group, sender, isTyping) => {
    if(isTyping){
        console.log(`${sender.jid} is typing in ${group.jid}`)
    }else{
        console.log(`${sender.jid} stopped typing in ${group.jid}`)
    }
})
```
`group`: a [`group`](#getting-started) object representing the group where the message was sent

`sender`: a [`user`](#getting-started) object representing the message sender

`isTyping`: true if the user is typing, false if he stopped

##### User Left Group

```javascript
Kik.on("userleftgroup", (group, user, kickedBy) => {
    console.log(`${user.jid} left the group: ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group

`user`: WIP

`kickedBy`: WIP

##### User Joined Group

```javascript
Kik.on("userjoinedgroup", (group, user, invitedBy) => {
    console.log(`${user.jid} joined the group: ${group.jid}`)
})
```
`group`: a [`group`](#getting-started) object representing the group

`user`: WIP

`invitedBy`: WIP

#### Private Events 
##### Received Private Message

```javascript
Kik.on("receivedprivatemsg", (sender, msg) => {
    console.log(`Received message from ${sender.jid}`)
})
```
`sender`: a [`user`](#getting-started) object representing the message sender

`msg`: the received message

##### Received Private System Message

```javascript
Kik.on("receivedprivatesysmsg", (sender, sysmsg) => {
    console.log(`Received message from ${sender.jid}`)
})
```
`sender`: a [`user`](#getting-started) object representing the message sender, included sended becausse modded users can spoof system messages

`sysmsg`: the received system message

##### Received Private Image

```javascript
Kik.on("receivedprivateimg", (sender, img) => {
    console.log(`Received image from ${sender.jid}`)
})
```
`sender`: a [`user`](#getting-started) object representing the message sender

`img`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the image

##### Received Private Sticker

```javascript
Kik.on("receivedprivatesticker", (sender, sticker) => {
    console.log(`Received Sticker from ${sender.jid}`)
})
```
`sender`: a [`user`](#getting-started) object representing the message sender

`sticker`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the sticker image

##### Received Private Video

```javascript
Kik.on("receivedprivatevid", (sender, vid) => {
    console.log(`Received Video from ${sender.jid}`)
})
```
`sender`: a [`user`](#getting-started) object representing the message sender

`vid`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the video

##### Received Private Gif

```javascript
Kik.on("receivedprivategif", (sender, gif) => {
    console.log(`Received Gif from ${sender.jid}`)
})
```
`sender`: a [`user`](#getting-started) object representing the message sender

`gif`: a [`buffer`](https://nodejs.org/api/buffer.html) object representing the gif video

##### Private Is Typing

```javascript
Kik.on("privatetyping", (sender, isTyping) => {
    if(isTyping){
        console.log(`${sender.jid} is typing`)
    }else{
        console.log(`${sender.jid} stopped typing`)
    }
})
```
`sender`: a [`user`](#getting-started) object representing the message sender

`isTyping`: true if the user is typing, false if he stopped

### Requests

Note that all callback functions can be excluded

#### Common Requests

You can provide a group's or a user's jid, they will automatically use 
the appropriate format

##### Send Message

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

```javascript
Kik.sendImage(jid, imgPath, allowForwarding, allowSaving)
```

`allowForwarding`: boolean, if false this image will not give the 
receiver a forwarding option. true by default

`allowSaving`: boolean, if false this image will not give the 
receiver a download option. true by default

returns a promise, make sure to use this inside an async function with the await keyword

##### Send Video

`Buffer variant`
```javascript
Kik.sendImage(jid, vid, img, allowForwarding, allowSaving, autoplay, loop, callback)
```

`String variant`
```javascript
Kik.sendImage(jid, vid, allowForwarding, allowSaving, autoplay, loop, callback)
```

`vid`: MP4 buffer object or url path string, the source video input, please avoid uploading videos longer than 5 minutes. if buffer is passed an image must be passed. required.

`img`: Image buffer objector url path string, if false this video will not give the 
receiver a download option. skipped a defailt previw image will be used [placeholder](https://github.com/nanofuxion/kik-node-api/src/ffmpegSwitch.js#L4)

`allowForwarding`: boolean, if false this video will not give the 
receiver a forwarding option. true by default

`allowSaving`: boolean, if false this video will not give the 
receiver a download option. true by default

`autoplay`: boolean, if true this video will play automatically 
upon loading. true by default

`loop`: boolean, if true this video will loop when played. true by default

returns a promise, make sure to use this inside an async function with the await keyword

##### Send Sticker

```javascript
Kik.sendImage(jid, stkrPath)
```
`allowForwarding`: boolean, if false this image will not give the 
receiver a forwarding option. true by default

`allowSaving`: Not implemented because sticker do not provide
 a download option.

returns a promise, make sure to use this inside an async function with the await keyword

#### Group Requests
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

#### Private Requests
##### Set Profile Name

```javascript
Kik.setProfileName(firstName, lastName)
```

## License
[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
