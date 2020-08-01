const EventEmitter = require("events"),
    KikConnection = require("./kikConnection"),
    DataHandler = require("./handlers/dataHandler"),
    Logger = require("./logger"),
    ImageManager = require("./managers/imgManager"),
    VideoManager = require("./managers/vidManager"),
    StickerManager = require("./managers/stickerManager"),
    sessionUtils = require("./sessionUtils"),
    initialRequest = require("./requests/initialRequest"),
    getNode = require("./requests/getNode"),
    auth = require("./requests/auth"),
    getRoster = require("./requests/getRoster"),
    sendChatMessage = require("./requests/sendChatMessage"),
    sendSysMsg = require("./requests/sendChatSysMsg"),
    getJidInfo = require("./requests/getJidInfo"),
    removeFriend = require("./requests/removeFriend"),
    addFriend = require("./requests/addFriend"),
    setAdmin = require("./requests/setAdmin"),
    setBanned = require("./requests/setBanned"),
    setGroupMember = require("./requests/setGroupMember"),
    setGroupName = require("./requests/setGroupName"),
    setProfileName = require("./requests/setProfileName"),
    sendImage = require("./requests/sendImage"),
    sendVideo = require("./requests/sendVideo"),
    sendSticker = require("./requests/sendSticker");

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
                    this.getJidInfo(group.users);
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
                this.vidManager = new VideoManager(this.params.username, this.params.password, this.session.node, true);
                this.stickerManager = new StickerManager(this.params.username, 
                    this.params.password, this.session.node, true);
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
            this.session.androidID, this.params.version));
    }
    resolveCaptcha(response){
        this.logger.log("info", `Resolving captcha with response ${response}`);
        this.connection.sendXmlFromJs(getNode(this.params.username, this.params.password, this.session.deviceID,
            this.session.androidID, this.params.version, response));
    }
    authRequest(){
        this.logger.log("info", "Sending auth request");
        this.connection.sendXmlFromJs(auth(this.params.username, this.params.password, this.session.node,
            this.session.deviceID, this.params.version), true);
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
    sendSysMsg(jid, msg, callback){
        this.logger.log("info",
            `Sending ${jid.endsWith("groups.kik.com")? "group" : "private"} message to ${jid} Content: ${msg}`);
        let req = sendSysMsg(jid, msg, jid.endsWith("groups.kik.com"));
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    async sendImage(jid, imgPath, allowForwarding, allowSaving, callback){
        this.logger.log("info",
            `Sending ${jid.endsWith("groups.kik.com")? "group" : "private"} image to ${jid} Path: ${imgPath}`);

        const image = await this.imgManager.uploadImg(imgPath, this.params.version);
        let req = sendImage(jid, image, jid.endsWith("groups.kik.com"), allowForwarding, allowSaving);
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    async sendVideo(jid, vidPath, imgPath, allowForwarding, allowSaving, autoplay, loop, callback){
        //allow skipping path if using a url instead of ffmpeg buffer
        if (!Buffer.isBuffer(vidPath)){
            loop = callback;  autoplay = loop;  allowSaving = autoplay; 
            allowForwarding = allowSaving; imgPath = allowForwarding;
        }
        this.logger.log("info",
            `Sending ${jid.endsWith("groups.kik.com")? "group" : "private"} video to ${jid} Path: 
                ${!(Buffer.isBuffer(vidPath))? vidPath: "is Buffer"}`);

        const video = await this.vidManager.uploadVid(vidPath, this.params.version, this.logger, imgPath);
        let req = sendVideo(jid, video, jid.endsWith("groups.kik.com"), allowForwarding, allowSaving, autoplay, loop);
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    async sendSticker(jid, imgPath, allowForwarding, allowSaving, callback){
        this.logger.log("info",
            `Sending ${jid.endsWith("groups.kik.com")? "group" : "private"} image to ${jid} Path: ${imgPath}`);

        const image = await this.stickerManager.uploadImg(imgPath, this.params.version);
        let req = sendSticker(jid, image, jid.endsWith("groups.kik.com"), allowForwarding, allowSaving);
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
    }
    getJidInfo(jids, callback){
        this.logger.log("info", `Requesting JID info for ${jids}`);
        let req = getJidInfo(jids);
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
};

