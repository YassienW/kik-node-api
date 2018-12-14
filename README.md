#Kik Node API

A chatting API for kik built with Node.js, based on <https://github.com/tomer8007/kik-bot-api-unofficial>

## Installation

For now you will need to simply download the repository, NPM installation coming soon

<!--
Use NPM to install foobar:

```bash
npm install kik-node-api
```
-->

##Usage

* [Getting started](#getting-started)

#####Events

1. [The Basics](#the-basics)
    * [Authenticated](#authenticated)
    * [Received Roster](#received-roster)
2. [Group Events](#group-events)
    * [Received Group Message](#received-group-message)
3. [Private Events](#private-events)
    * [Received Private Message](#received-private-message)

#####Requests

1. [Group Requests](#group-requests)
2. [Private Requests](#private-requests)

---

###Getting Started

You can use the API by creating an instance of `KikClient`, you'll use it to listen
to events and send requests to kik

```javascript
const KikClient = require("./src/kikClient")

Kik = new KikClient({
    username: "username",
    password: "1234",
    kikNode: null,
    trackGroupInfo: true,
    trackUserInfo: true,
    trackFriendInfo: true
})

Kik.connect()
```

###Events
####The Basics
`KikClient` uses Node's [Event Emitter](https://nodejs.org/api/events.html) class
to handle events, all events are attached in the following way:

```javascript
Kik.on(eventname, (params) => {
    //do stuff here
})
```

Below are the details of all events emitted by the `KikClient` class
#####Authenticated

#####Received Roster


####Group Events
#####Received Group Message

####Private Events
#####Received Private Message

###Requests
####Group Requests

####Private Requests

<!--
## Contributing


## License
[MIT](https://choosealicense.com/licenses/mit/)
-->
