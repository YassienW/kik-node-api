module.exports = (client, callbacks, id, data) => {
    let type = data.find("message").attrs.type;
    let dataStr = data.toString();

    if(type === "groupchat"){
        let group = client.groups.find((group) => {
            return group.jid === data.find("g").attrs.jid;
        });
        let user = {
            jid: data.find("message").attrs.from,
            username: null,
            displayName: null,
            pic: null
        };

        //status message froms contain the group JID not the user JID, ignore them
        if(client.params.trackUserInfo && !data.find("status")){
            let userSearch = client.users.find((user) => {
                return user.jid === data.find("message").attrs.from;
            });
            user = (userSearch? userSearch : user);
        }
        if(client.params.trackFriendInfo && !data.find("status")){
            let userSearch = client.friends.find((user) => {
                return user.jid === data.find("message").attrs.from;
            });
            user = (userSearch? userSearch : user);
        }

        if(data.find("body")){
            client.emit("receivedgroupmsg", group, user, data.find("body").text);
        }else if(data.find("is-typing")){
            client.emit("recievedgrouptyping", group, user, data.find("is-typing").attrs.val === "true");
        }else if(data.find("duration") && data.find("file-url")) { 
            client.emit("receivedgroupvid", group, user, client.vidManager.getVid(data.find("file-url").text, false));  
        }else if(data.find("video-should-autoplay") && data.find("uris")) { 
            client.emit("receivedgroupgif", group, user, client.vidManager.getGif(
                data.find("uris").contents[0].contents[0]._text, false));  
        }else if(data.find("images")){
            client.emit("receivedgroupimg", group, user, client.imgManager.getImg(data.find("file-url").text, false, group.jid));
        }else if(data.find("png-preview") && data.find("uris")) { //solved crashes when sent cards
            //eslint-disable-next-line max-len
            client.emit("receivedgroupsticker", group, user, client.stickerManager.getImg(data.find("png-preview").text, false));
        }else if(data.find("status")){
            let status = data.find("status");
            //user's jid is in the status here, if it wasn't set, set it
            user = (user.jid? user : {...user, jid: status.attrs.jid});

            if(status.text.includes("left") || status.text.includes("removed")){
                let kickedBy = (status.text.includes("removed")? status.text.split("has")[0].trim() : null);

                client.emit("userleftgroup", group, user, kickedBy);
            }else if(status.text.includes("joined")){
                let invitedBy = (status.text.includes("invited")? status.text.split("by")[1].trim() : null);

                if(client.params.trackUserInfo){
                    client.getUserInfo(status.attrs.jid, false,(users) => {
                        client.emit("userjoinedgroup", group, users[0], invitedBy);
                    });
                }else{
                    client.emit("userjoinedgroup", group, user, invitedBy);
                }
            }
        }else if(data.find("sysmsg")) {
            if(dataStr.includes("</pic>") && dataStr.includes("</g>") && dataStr.includes("</n>")){
                try{
                    let str2 = () => {
                        var str1 = data.toString();
                        str1 = str1.includes("<b>")? str1.replace(str1.split('</pic>')[0], '').replace('</pic>', '')
                            .replace(str1.split('<b>')[1], '').replace('<b>', '') : str1;
                        str1 = str1.includes("</m>")? str1.split('</m>').join('</m>, ').replace(/,\s*$/, "") : str1;
                        return str1;
                    };
                    client.emit("joinedgroup", group, data.find("sysmsg").text, str2());
                }catch(e){}
            }else{
                client.emit("receivedgroupsysmsg", group, user, data.find("sysmsg")? data.find("sysmsg").text : null);
            }
        }
    }else if(type === "chat" || type === "is-typing"){
        let jid = data.find("message").attrs.from;
        let user = {jid: jid, username: null, displayName: null};

        if(client.params.trackFriendInfo /*|| client.params.trackUserInfo*/){
            //try to find the user data in friends first
            let userSearch = client.friends.find(friend => {return friend.jid === jid;});
            user = (userSearch? userSearch : user);

            /*if(!user){
                  //try to find the user data in users
                  user = client.users.find(user => {return user.jid === jid})
                  //if we don't find the user in users, and user tracking is on, get his jid info (this automatically
                  //adds him//to users), otherwise we return what we found
                  if(!user && client.params.trackUserInfo){
                      client.getJidInfo(data.find("message").attrs.from, (users) => {
                          client.emit("receivedprivatemsg", users[0], data.find("body").text)
                      })
                  }else{
                      client.emit("receivedprivatemsg", user, data.find("body").text)
                  }
              }else{
                  client.emit("receivedprivatemsg", user, data.find("body").text)
              }*/
        }

        if(data.find("xiphias-mobileremote-call")){
            //safetynet message
        }else if(dataStr.includes("inline-username-search")){
            client.emit("receivedprivatefriendsearch", user);
        }else if(dataStr.includes("username-mention")){
            client.emit("receivedprivatefriendmention", user);
        }else if(data.find("body")){
            client.emit("receivedprivatemsg", user, data.find("body").text);
        }else if(data.find("sysmsg")) {
            client.emit("receivedprivatesysmsg", user, data.find("sysmsg")? data.find("sysmsg").text : null);
        }else if(type === "is-typing"){
            client.emit("receivedprivatetyping", user, data.find("is-typing").attrs.val === "true");
        }else if(data.find("duration") && data.find("file-url")) { 
            client.emit("receivedprivatevid", user, client.vidManager.getVid(data.find("file-url").text, true));  
        }else if(data.find("video-should-autoplay") && data.find("uris")) { 
            client.emit("receivedprivategif", user, client.vidManager.getGif(data.find("uris").contents[0].contents[0]._text, true));     
        }else if(data.find("images")){
            client.emit("receivedprivateimg", user, client.imgManager.getImg(data.find("file-url").text, true, user.jid));
        }else if(data.find("png-preview") && data.find("uris")) { //solved crashes when sent cards
            //eslint-disable-next-line max-len
            client.emit("receivedprivatesticker", user, client.stickerManager.getImg(data.find("png-preview").text, true));
        }
        
        else if(dataStr.includes("inline-username-search")){
            client.emit("receivedprivatefriendsearch", user);
        }else if(dataStr.includes("username-mention")){
            client.emit("receivedprivatefriendmention", user);
        }else if(data.find("body")){
            client.emit("receivedprivatemsg", user, data.find("body").text);
        }else if(type === "is-typing"){
            client.emit("privatetyping", user, data.find("is-typing").attrs.val === "true");
        }else if(data.find("images")){
            client.emit("receivedprivateimg", user, client.imgManager.getImg(data.find("file-url").text, true, user.jid));
        }
    }else if(type === "receipt"){
        let receipt = data.find("receipt").attrs.type;

        data.findAll("msgid").forEach(msgid => {
            let callback = callbacks.get(msgid.attrs.id);
            if(callback){
                //only delete the callback function when you get the read receipt, this WILL cause a leak if a client
                //doesn't return read receipts for any reason
                if(receipt === "delivered"){
                    callback(true, false);
                }else if(receipt === "read"){
                    callback(false, true);
                    callbacks.delete(msgid.attrs.id);
                }
            }
        });
    }
};
