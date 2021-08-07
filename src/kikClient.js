const EventEmitter = require("events"),
    KikConnection = require("./kikConnection"),
    DataHandler = require("./handlers/dataHandler"),
    Logger = require("./helpers/logger"),
    ImageManager = require("./helpers/imgManager"),
    sessionUtils = require("./helpers/sessionUtils"),
    anonymousAuth = require("./requests/anonymousAuth"),
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
    joinGroup = require("./requests/group/joinGroup"),
    createAccount = require("./requests/account/createAccount");

module.exports = class KikClient extends EventEmitter {
    constructor(params){
        super();

        this.dataHandler = new DataHandler(this);
        const {file, console} = params.logger || {};
        this.logger = new Logger(file, console, "_ANON_");
        //this session is temporary and will be replaced by the saved session if user logs in
        this.session = sessionUtils.createSession();

        this.on("receivedcaptcha", (captchaUrl) => {
            if(params.promptCaptchas){
                let stdin = process.stdin, stdout = process.stdout;

                console.log("Please resolve captcha by going to: " + captchaUrl +
                    "&callback_url=https://kik.com/captcha-url");
                stdout.write("Captcha response: ");

                stdin.once("data", (data) => {
                    const captchaResponse = data.toString().trim();
                    if(this.createAccountParams){
                        const {email, username, password, firstName, lastName, birthdate, callback}
                            = this.createAccountParams;
                        this.createAccount(email, username, password, firstName, lastName, birthdate, captchaResponse,
                            callback);
                    }else{
                        this.getNode(captchaResponse);
                    }
                });
            }
        });
    }
    connect(onConnected){
        if(!this.connection || this.connection.socket.destroyed){
            this.connection = new KikConnection(this.logger, err => {
                if(err){
                    this.logger.log("error", err);
                }else{
                    this.emit("connected");
                    onConnected();
                }
            });
            this.connection.on("data", (data) => {
                this.dataHandler.handleData(data);
            });
            this.connection.on("diconnected", (data) => {
                this.emit("disconnected");
            });
        } else {
            onConnected();
        }
    }
    authenticate(usernameOrEmail, password){
        if(usernameOrEmail && !password || password && !usernameOrEmail){
            throw new Error("Username/email and password must be provided together, check your authenticate call");
        }
        this.connect(() => {
            if(usernameOrEmail && password) {
                this.username = usernameOrEmail;
                this.password = password;
                this.session = sessionUtils.getSession(usernameOrEmail);
                if(!this.session){
                    this.session = sessionUtils.createSession();
                }
                if(this.session.node){
                    this.imgManager = new ImageManager(usernameOrEmail, password, this.session.node, true);
                    this.authRequest(usernameOrEmail, password);
                }else{
                    this.getNode();
                }
            }else{
                this.anonymousAuthRequest();
            }
        });
    }
    //used to set the node and start an authorized session
    setNode(node, username){
        //append the node to the session object
        this.session = {...this.session, node};
        sessionUtils.saveSession(username || this.createAccountParams.username, this.session);

        this.logger.log("info", "Disconnecting due to node received");
        this.connection.disconnect();
        // this is not a registration response
        if(username){
            //in case of email login
            this.username = username;
            this.logger.updateUsername(username);
            //initiate a new connection, with the node set this time
            this.logger.log("info", "Reconnecting with node value");
            this.authenticate(this.username, this.password);
        }else{
            this.createAccountParams = null;
        }
    }
    getNode(captcha){
        this.logger.log("info", "Requesting kik node");
        this.anonymousAuthRequest();
        this.connection.sendXmlFromJs(getNode(this.username, this.password, this.session.deviceID,
            this.session.androidID, captcha));
    }
    authRequest(username, password){
        this.logger.log("info", "Sending auth request");
        this.connection.sendXmlFromJs(auth(username, password, this.session.node,
            this.session.deviceID), true);
    }
    anonymousAuthRequest(){
        this.logger.log("info", "Sending anonymous auth request");
        this.connection.sendXmlFromJs(anonymousAuth(this.session.deviceID), true);
    }
    createAccount(email, username, password, firstName, lastName, birthdate, captchaResponse, callback){
        this.createAccountParams =
            {email, username, password, firstName, lastName, birthdate, callback};
        this.logger.log("info", "Creating account");
        let req = createAccount(email, username, password, firstName, lastName, birthdate, this.session.deviceID,
            this.session.androidID, captchaResponse);
        this.connection.sendXmlFromJs(req.xml);
        if(callback){
            this.dataHandler.addCallback(req.id, callback);
        }
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
        this.logger.log("info", `Requesting user info with Xiphias = ${useXiphias} for ${usernamesOrJids}`);

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
        if(searchQuery.length < 2){
            throw new Error("Search query must be at least 2 characters long");
        }
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

