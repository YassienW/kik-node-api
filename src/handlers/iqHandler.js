const protobuf = require("../protobuf/protobufParser");

module.exports = (client, callbacks, id, data) => {
    const query = data.find("query");
    if(!query){ return; }
    const xmlns = query.attrs.xmlns;

    if(xmlns === "jabber:iq:register"){
        if(data.find("node")){
            client.setNode(data.find("node").text);
        }else if(data.find("captcha-url")){
            client.emit("receivedcaptcha", data.find("captcha-url").text);
        }else{
            //handle others
        }
    }else if(xmlns === "jabber:iq:roster"){
        let groups = [], friends = [];
        //fill up friends
        data.findAll("item").forEach(friend => {
            const friendObj = { jid: null, username: null, displayName: null, pic: null };
            friendObj.jid = friend.attrs.jid;
            friendObj.username = friend.find("username")? friend.find("username").text : null;
            friendObj.displayName = friend.find("display-name")? friend.find("display-name").text : null;
            client.getUserInfo(friend.attrs.jid, false, (user) => {
                if(user.length != 0){ friendObj.pic = user[0]? user[0].pic : null; }
            });
            friends.push(friendObj);
        });
        //fill up groups
        data.findAll("g").forEach(group => {
            let users = [];
            group.findAll("m").forEach((user) => {
                const userObj = {jid: user.text};
                if(user.attrs.s){
                    userObj.isOwner = true;
                }
                if(user.attrs.a){
                    userObj.isAdmin = true;
                }
                users.push(userObj);
            });
            groups.push({
                jid: group.attrs.jid,
                code: group.find("code")? group.find("code").text : null,
                name: group.find("n")? group.find("n").text: null,
                users: users
            });
        });
        //trigger event and send callback if registered
        client.emit("receivedroster", groups, friends);
        let callback = callbacks.get(id);
        if(callback){
            callback(groups, friends);
            callbacks.delete(id);
        }
    }else if(xmlns.startsWith("kik:iq:friend")){
        let users = [];
        //handle empty results
        const error = data.find("error");
        if(error && error.attrs.code === "404"){
            //no results
        }else{
            let searchUser = (user) => {
                const userInfo = { jid: null, displayName: null, pic: null, userInFriends: null, username: null }
                userInfo.pic = user.find("pic")? user.find("pic").text : null;
                userInfo.displayName = user.find("display-name")? user.find("display-name").text : null;
                userInfo.username = user.find("username").text === "Username unavailable"? null  : user.find("username").text;
                userInfo.userInFriends = JSON.stringify(client.friends).includes(userInfo.pic)? true : false;
                if(userInfo.userInFriends){
                    client.friends.map(friend => {
                        if(friend.pic == userInfo.pic){
                            userInfo.jid = friend.jid? friend.jid : null;
                            userInfo.username = friend.username? friend.username : null;
                        }
                    });
                }
                return userInfo;
            }
            users = data.findAll("item").map(user => ({
                jid: searchUser(user).jid,
                aliasJid: user.attrs.jid.includes('_a@')? user.attrs.jid : null,
                username: searchUser(user).username,
                displayName: searchUser(user).displayName,
                //sometimes, when you are the user there is no pic (maybe there are other cases idk)
                pic: searchUser(user).pic
            }));
        }
        //trigger event and send callback if registered
        client.emit("receivedjidinfo", users);
        let callback = callbacks.get(id);
        if(callback){
            callback(users);
            callbacks.delete(id);
        }
    }else if(xmlns === "kik:iq:xiphias:bridge"){
        const method = query.attrs.method;

        if(method.startsWith("GetUsers")){
            const {users, payloads} = protobuf.lookupType(`${method}Response`)
                .decode(Buffer.from(data.find("body").text, "base64"));

            let parsedUsers;
            if(users){
                parsedUsers = users
                    .map(({ backgroundProfilePicExtension, registrationElement, kinUserIdElement }) => ({
                        kinUserId: kinUserIdElement.kinUserId.id,
                        registrationTimestamp: registrationElement.creationDate.seconds.low,
                        backgroundPic: backgroundProfilePicExtension &&
                            backgroundProfilePicExtension.extensionDetail.pic
                    }));
            }else if(payloads){
                parsedUsers = payloads
                    .map(({ publicGroupMemberProfile }) => ({
                        displayName: publicGroupMemberProfile.displayName &&
                            publicGroupMemberProfile.displayName.displayName,
                        kinUserId: publicGroupMemberProfile.kinUserIdElement.kinUserId.id,
                        registrationTimestamp: publicGroupMemberProfile.registrationElement.creationDate.seconds.low,
                    }));
            }

            let callback = callbacks.get(id);
            if(callback){
                callback(parsedUsers);
                callbacks.delete(id);
            }
        }else if(method === "FindGroups"){
            const parsedGroups = protobuf.lookupType("FindGroupsResponse")
                .decode(Buffer.from(data.find("body").text, "base64")).match
                .map(({jid, displayData, groupJoinToken, memberCount}) => {
                    const base64JoinToken = groupJoinToken.token.toString("base64");
                    return {
                        jid: `${jid.localPart}@groups.kik.com`,
                        code: displayData.hashtag,
                        name: displayData.displayName,
                        joinToken: base64JoinToken.endsWith("=")?
                            base64JoinToken.slice(0, base64JoinToken.indexOf("=")): base64JoinToken,
                        memberCount,
                    };
                });
            let callback = callbacks.get(id);
            if(callback){
                callback(parsedGroups);
                callbacks.delete(id);
            }
        }
    }else if(xmlns == "kik:groups:admin"){
        if(data.find("iq").attrs.type == "error"){
            let errorCode = data.toString().includes('error code=')? data.toString().split('error code=\"')[1].split('\"')[0] : null;
            //console.log(`an error occured: ${errorCode}`)
        }
    }
};
