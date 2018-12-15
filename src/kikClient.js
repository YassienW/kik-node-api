const EventEmitter = require("events"),
    KikConnection = require("./kikConnection"),
    logger = require("./logger"),
    dataHandler = require("./dataHandler")
    initialRequest = require("./requests/initialRequest"),
    getNode = require("./requests/getNode"),
    auth = require("./requests/auth"),
    getRoster = require("./requests/getRoster"),
    sendChatMessage = require("./requests/sendChatMessage"),
    jidInfo = require("./requests/getJidInfo"),
    removeFriend = require("./requests/removeFriend"),
    addFriend = require("./requests/addFriend")

class KikClient extends EventEmitter {
    constructor(params){
        super()

        this.params = params

        //used for tracking
        this.groups = []
        this.friends = []
        this.users = []

        this.on("receivedroster", (groups, friends) => {
            if(this.params.trackGroupInfo){
                this.groups = groups
                if(this.params.trackUserInfo){
                    this.groups.forEach((group) => {
                        this.getJidInfo(group.users)
                    })
                }
            }
            if(this.params.trackFriendInfo){
                this.friends = friends
            }
        })
        this.on("receivedjidinfo", (users) => {
            if(this.params.trackUserInfo){
                this.users.push(...users)
            }
        })
        this.on("userleftgroup", (user) => {
            this.users.splice(user, 1)
        })
    }
    connect(){
        this.connection = new KikConnection(err => {
            if(err){
                console.log(err)
            }else{
                if(this.params.kikNode){
                    this.authRequest()
                }else{
                    this.initiateNodeConnection()
                }
            }
        })
        this.connection.on("data", (data) => {
            dataHandler(data, this)
        })
    }
    //we have to do this before requesting the kik node, but not before auth
    initiateNodeConnection(){
        this.connection.sendXmlFromJs(initialRequest(), true)
    }
    getNode(){
        this.connection.sendXmlFromJs(getNode(this.params.username, this.params.password))
    }
    authRequest(){
        this.connection.sendXmlFromJs(auth(this.params.username, this.params.password, this.params.kikNode), true)
    }
    getRoster(){
        this.connection.sendXmlFromJs(getRoster())
    }
    sendGroupMessage(groupJid, msg){
        this.connection.sendXmlFromJs(sendChatMessage(groupJid, msg, true))
    }
    sendPrivateMessage(userJid, msg){
        this.connection.sendXmlFromJs(sendChatMessage(userJid, msg, false))
    }
    getJidInfo(jids){
        this.connection.sendXmlFromJs(jidInfo(jids))
    }
    addFriend(jid){
        this.connection.sendXmlFromJs(addFriend(jid))
    }
    removeFriend(jid){
        this.connection.sendXmlFromJs(removeFriend(jid))
    }
}
module.exports = KikClient

