const EventEmitter = require("events"),
    KikConnection = require("./kikConnection"),
    logger = require("./logger"),
    dataHandler = require("./dataHandler")
    initialRequest = require("./requests/initialRequest"),
    getNode = require("./requests/getNode"),
    auth = require("./requests/auth"),
    getRoster = require("./requests/getRoster"),
    sendGroupMessage = require("./requests/sendGroupMessage"),
    jidInfo = require("./requests/getJidInfo")

class KikClient extends EventEmitter {
    constructor(params){
        super()

        this.params = params
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
        this.connection.sendXmlFromJson(initialRequest(), true)
    }
    getNode(){
        this.connection.sendXmlFromJson(getNode(this.params.username, this.params.password))
    }
    authRequest(){
        this.connection.sendXmlFromJson(auth(this.params.username, this.params.password, this.params.kikNode), true)
    }
    getRoster(){
        this.connection.sendXmlFromJson(getRoster())
    }
    sendGroupMessage(groupJid, msg){
        this.connection.sendXmlFromJson(sendGroupMessage(groupJid, msg))
    }
    sendPrivateMessage(userJid, msg){

    }
    getJidInfo(jids){
        this.connection.sendXmlFromJson(jidInfo(jids))
    }
}
module.exports = KikClient

