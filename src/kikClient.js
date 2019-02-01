const EventEmitter = require("events"),
    KikConnection = require("./kikConnection"),
    DataHandler = require("./handlers/dataHandler"),
    Logger = require("./logger"),
    ImageManager = require("./imgManager")
    sessionUtils = require("./sessionUtils"),
    initialRequest = require("./requests/initialRequest"),
    getNode = require("./requests/getNode"),
    auth = require("./requests/auth"),
    getRoster = require("./requests/getRoster"),
    sendChatMessage = require("./requests/sendChatMessage"),
    getJidInfo = require("./requests/getJidInfo"),
    removeFriend = require("./requests/removeFriend"),
    addFriend = require("./requests/addFriend"),
    setAdmin = require("./requests/setAdmin"),
    setBanned = require("./requests/setBanned"),
    setGroupMember = require("./requests/setGroupMember")

class KikClient extends EventEmitter {
    constructor(params){
        super()

        this.params = params
        this.dataHandler = new DataHandler(this)
        this.logger = new Logger(["info", "warning", "error"], this.params.username)
        this.imgManager = new ImageManager(this.params.username, true)

        //used for tracking
        this.groups = []
        this.friends = []
        this.users = []

        this.on("receivedroster", (groups, friends) => {
            this.groups = groups
            if(this.params.trackUserInfo){
                //perhaps i could combine and send to make it more efficient, depending on the rate limit
                this.groups.forEach((group) => {
                    this.getJidInfo(group.users)
                })
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
        this.on("receivedcaptcha", (captchaUrl) => {
            if(this.params.promptCaptchas){
                let stdin = process.stdin, stdout = process.stdout

                console.log("Please resolve captcha by going to: " + captchaUrl)
                stdout.write("Captcha response: ")

                stdin.once("data", (data) => {
                    this.resolveCaptcha(data.toString().trim())
                });
            }
        })
    }
    connect(){
        this.connection = new KikConnection(this.logger, err => {
            if(err){
                this.logger.log("error", err)
            }else{
                //don't read it from file again if it's already set
                this.session = (this.session? this.session : sessionUtils.getSession(this.params.username))
                if(this.session.node){
                    this.authRequest()
                }else{
                    this.initiateNodeConnection()
                }
            }
        })
        this.connection.on("data", (data) => {
            this.dataHandler.handleData(data)
        })
    }
    //used to set the node and start an authorized session
    setNode(node){
        //append the node to the session object
        this.session = {...this.session, node: node}
        sessionUtils.setSession(this.params.username, this.session)
        //we have to disconnect first, then initiate a new connection, with the node set this time
        this.connection.disconnect()
        this.connect()
    }
    //we have to do this before requesting the kik node, but not before auth
    initiateNodeConnection(){
        this.logger.log("info", "Initiating kik node connection")
        this.connection.sendXmlFromJs(initialRequest(), true)
    }
    getNode(){
        this.logger.log("info", "Requesting kik node")
        this.connection.sendXmlFromJs(getNode(this.params.username, this.params.password, this.session.deviceID,
            this.session.androidID))
    }
    resolveCaptcha(response){
        this.logger.log("info", `Resolving captcha with response ${response}`)
        this.connection.sendXmlFromJs(getNode(this.params.username, this.params.password, this.session.deviceID,
            this.session.androidID, response))
    }
    authRequest(){
        this.logger.log("info", "Sending auth request")
        this.connection.sendXmlFromJs(auth(this.params.username, this.params.password, this.session.node,
            this.session.deviceID), true)
    }
    getRoster(callback){
        this.logger.log("info", "Getting roster")
        let req = getRoster()
        this.connection.sendXmlFromJs(req.xml)
        if(callback){
            this.dataHandler.addCallback(req.id, callback)
        }
    }
    sendGroupMessage(groupJid, msg, callback){
        this.logger.log("info", `Sending group message to ${groupJid} Content: ${msg}`)
        let req = sendChatMessage(groupJid, msg, true)
        this.connection.sendXmlFromJs(req.xml)
        if(callback){
            this.dataHandler.addCallback(req.id, callback)
        }
    }
    sendPrivateMessage(userJid, msg, callback){
        this.logger.log("info", `Sending private message to ${userJid} Content: ${msg}`)
        let req = sendChatMessage(userJid, msg, false)
        this.connection.sendXmlFromJs(req.xml)
        if(callback){
            this.dataHandler.addCallback(req.id, callback)
        }
    }
    getJidInfo(jids, callback){
        this.logger.log("info", `Requesting JID info for ${jids}`)
        let req = getJidInfo(jids)
        this.connection.sendXmlFromJs(req.xml)
        if(callback){
            this.dataHandler.addCallback(req.id, callback)
        }
    }
    addFriend(jid){
        this.logger.log("info", `Adding friend with JID ${jid}`)
        this.connection.sendXmlFromJs(addFriend(jid))
    }
    removeFriend(jid){
        this.logger.log("info", `Removing friend with JID ${jid}`)
        this.connection.sendXmlFromJs(removeFriend(jid))
    }
    setAdmin(groupJid, userJid, bool){
        this.logger.log("info", `Setting admin = ${bool} for jid ${userJid} in group ${groupJid}`)
        this.connection.sendXmlFromJs(setAdmin(groupJid, userJid, bool))
    }
    setBanned(groupJid, userJid, bool){
        this.logger.log("info", `Setting banned = ${bool} for jid ${userJid} in group ${groupJid}`)
        this.connection.sendXmlFromJs(setBanned(groupJid, userJid, bool))
    }
    setGroupMember(groupJid, userJid, bool){
        this.logger.log("info", `Setting member = ${bool} for jid ${userJid} in group ${groupJid}`)
        this.connection.sendXmlFromJs(setGroupMember(groupJid, userJid, bool))
    }
}
module.exports = KikClient

