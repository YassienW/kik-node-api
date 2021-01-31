const EventEmitter = require("events"),
    KikConnection = require("./kikConnection"),
    DataHandler = require("./handlers/dataHandler"),
    Logger = require("./logger"),
    ImageManager = require("./imgManager"),
    sessionUtils = require("./sessionUtils"),
    initialRequest = require("./requests/initialRequest"),
    getNode = require("./requests/getNode"),
    auth = require("./requests/auth"),
    getRoster = require("./requests/account/getRoster"),
    sendChatMessage = require("./requests/sendChatMessage"),
    getUserInfo = require("./requests/getUserInfo"),
    getXiphiasUserInfo = require("./requests/getXiphiasUserInfo"),
    removeFriend = require("./requests/account/removeFriend"),
    addFriend = require("./requests/account/addFriend"),
    setAdmin = require("./requests/group/setAdmin"),
    setBanned = require("./requests/group/setBanned"),
    setGroupMember = require("./requests/group/setGroupMember"),
    setGroupName = require("./requests/group/setGroupName"),
    setProfileName = require("./requests/account/setProfileName"),
    sendImage = require("./requests/sendImage"),
    leaveGroup = require("./requests/group/leaveGroup"),
    setEmail = require("./requests/account/setEmail"),
    setPassword = require("./requests/account/setPassword"),
    searchGroups = require("./requests/group/searchGroups"),
    joinGroup = require("./requests/group/joinGroup");

module.exports = class KikClient extends EventEmitter {
    constructor(params){
        super();

        this.params = params;
        this.dataHandler = new DataHandler(this);
        this.logger = new Logger(["info", "warning", "error"], this.params.username);

        //used for tracking
        this.groups = [];
        this.friends = [];
        this.users = [];

        this.on("receivedroster", (groups, friends) => {
            this.groups = groups;
            if(this.params.trackUserInfo){
                //perhaps i could combine and send to make it more efficient, depending on the rate limit
                this.groups.forEach((group) => {
                    this.getUserInfo(group.users);
                });
            }
            if(this.params.trackFriendInfo){
                this.friends = friends;
            }
        });
        this.on("receivedjidinfo", (users) => {
            if(this.params.trackUserInfo){
                this.users.push(...users);
            }
        });
        this.on("userleftgroup", (user) => {
            this.users.splice(user, 1);
        });
        this.on("receivedcaptcha", (captchaUrl) => {
            if(this.params.promptCaptchas){
                let stdin = process.stdin, stdout = process.stdout;

                console.log("Please resolve captcha by going to: " + captchaUrl);
                stdout.write("Captcha response: ");

                stdin.once("data", (data) => {
                    this.resolveCaptcha(data.toString().trim());
                });
            }
        });
    }
    connect(){
        this.connection = new KikConnection(this.logger, err => {
            if(err){
                this.logger.log("error", err);
            }else{
                //don't read it from file again if it's already set
                this.session = (this.session? this.session : sessionUtils.getSession(this.params.username));
                if(this.session.node){
                    this.authRequest();
                }else{
                    this.initiateNodeConnection();
                }
                //we have to initialize imgManager after we have the session node
                this.imgManager = new ImageManager(this.params.username, this.params.password, this.session.node, true);
            }
        });
        this.connection.on("data", (data) => {
            this.dataHandler.handleData(data);
        });
    }
    //used to set the node and start an authorized session
    setNode(node){
        //append the node to the session object
        this.session = {...this.session, node: node};
        sessionUtils.setSession(this.params.username, this.session);
        //we have to disconnect first, then initiate a new connection, with the node set this time
        this.connection.disconnect();
        this.connect();
    }
    //we have to do this before requesting the kik node, but not before auth
    initiateNodeConnection(){
        this.logger.log("info", "Initiating kik node connection");
        this.connection.sendXmlFromJs(initialRequest(), true);
    }
    getNode(){
        this.logger.log("info", "Requesting kik node");
        this.connection.sendXmlFromJs(getNode(this.params.username, this.params.password, this.session.deviceID,
            this.session.androidID));
    }
    resolveCaptcha(response){
        this.logger.log("info", `Resolving captcha with response ${response}`);
        this.connection.sendXmlFromJs(getNode(this.params.username, this.params.password, this.session.deviceID,
            this.session.androidID, response));
    }
    authRequest(){
        this.logger.log("info", "Sending auth request");
        this.connection.sendXmlFromJs(auth(this.params.username, this.params.password, this.session.node,
            this.session.deviceID), true);
    }
    getRoster(callback){
        this.logger.log("info", "Getting roster");
        let req = getRoster();
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    sendMessage(jid, msg, callback){
        this.logger.log("info",
            `Sending ${jid.endsWith("groups.kik.com")? "group" : "private"} message to ${jid} Content: ${msg}`);
        let req = sendChatMessage(jid, msg, jid.endsWith("groups.kik.com"));
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    async sendImage(jid, imgPath, allowForwarding, allowSaving, callback){
        this.logger.log("info",
            `Sending ${jid.endsWith("groups.kik.com")? "group" : "private"} image to ${jid} Path: ${imgPath}`);

        const image = await this.imgManager.uploadImg(imgPath);
        let req = sendImage(jid, image, jid.endsWith("groups.kik.com"), allowForwarding, allowSaving);
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    getUserInfo(usernamesOrJids, useXiphias, callback){
        this.logger.log("info", `Requesting ${useXiphias && "Xiphias"} user info for ${usernamesOrJids}`);

        if(!Array.isArray(usernamesOrJids)){
            usernamesOrJids = [usernamesOrJids];
        }
        let req;
        if(useXiphias){
            req = getXiphiasUserInfo(usernamesOrJids);
        }else{
            req = getUserInfo(usernamesOrJids);
        }
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    addFriend(jid){
        this.logger.log("info", `Adding friend with JID ${jid}`);
        this.connection.sendXmlFromJs(addFriend(jid));
    }
    removeFriend(jid){
        this.logger.log("info", `Removing friend with JID ${jid}`);
        this.connection.sendXmlFromJs(removeFriend(jid));
    }
    setAdmin(groupJid, userJid, bool){
        this.logger.log("info", `Setting admin = ${bool} for jid ${userJid} in group ${groupJid}`);
        this.connection.sendXmlFromJs(setAdmin(groupJid, userJid, bool));
    }
    setBanned(groupJid, userJid, bool){
        this.logger.log("info", `Setting banned = ${bool} for jid ${userJid} in group ${groupJid}`);
        this.connection.sendXmlFromJs(setBanned(groupJid, userJid, bool));
    }
    setGroupMember(groupJid, userJid, bool){
        this.logger.log("info", `Setting member = ${bool} for jid ${userJid} in group ${groupJid}`);
        this.connection.sendXmlFromJs(setGroupMember(groupJid, userJid, bool));
    }
    setGroupName(groupJid, groupName){
        this.logger.log("info", `Setting group name to ${groupName} for group ${groupJid}`);
        this.connection.sendXmlFromJs(setGroupName(groupJid, groupName));
    }
    setProfileName(firstName, lastName){
        this.logger.log("info", `Setting profile name to ${firstName} ${lastName}`);
        this.connection.sendXmlFromJs(setProfileName(firstName, lastName));
    }
    leaveGroup(groupJid){
        this.logger.log("info", `Leaving group ${groupJid}`);
        this.connection.sendXmlFromJs(leaveGroup(groupJid));
    }
    setEmail(newEmail, password){
        this.logger.log("info", `Setting email to ${newEmail}`);
        this.connection.sendXmlFromJs(setEmail(newEmail, password));
    }
    setPassword(oldPassword, newPassword){
        this.logger.log("info", "Setting password");
        this.connection.sendXmlFromJs(setPassword(oldPassword, newPassword));
    }
    searchGroups(searchQuery, callback){
        this.logger.log("info", `Searching groups with term ${searchQuery}`);
        let req = searchGroups(searchQuery);
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    joinGroup(groupJid, groupCode, joinToken){
        this.logger.log("info", `Joining group ${groupCode}`);
        this.connection.sendXmlFromJs(joinGroup(groupJid, groupCode, joinToken));
    }
};

