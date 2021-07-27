module.exports = async (client, callbacks, id, data) => {
    let type = data.find("message").attrs.type;

    if(type === "groupchat"){
        let groupJid = data.find("g").attrs.jid;
        let userJid = data.find("message").attrs.from;

        if(data.find("body")){
            client.emit("receivedgroupmsg", groupJid, userJid, data.find("body").text);
        }else if(data.find("is-typing")){
            client.emit("grouptyping", groupJid, userJid, data.find("is-typing").attrs.val === "true");
        }else if(data.find("images")){
            let parseData = client.imgManager.parseAppData(data);
            let file_path = await client.imgManager.getImg(parseData.file_url, false, groupJid,parseData.file_name);    
            client.emit("receivedgroupimg", groupJid, userJid, file_path);
        }else if(data.find("status")){
            let status = data.find("status");
            //userJid and groupJid are different for status
            groupJid = userJid;
            userJid = status.attrs.jid;

            if(status.text.includes("left") || status.text.includes("removed")){
                let wasKicked = status.text.includes("removed");

                client.emit("userleftgroup", groupJid, userJid, wasKicked);
            }else if(status.text.includes("joined")){
                let invitedBy = (status.text.includes("invited")? status.text.split("by")[1].trim() : null);

                client.emit("userjoinedgroup", groupJid, userJid, invitedBy);
            }
        }
    }else if(type === "chat" || type === "is-typing"){
        let userJid = data.find("message").attrs.from;

        if(data.find("xiphias-mobileremote-call")){
            //safetynet message
        }else if(data.find("body")){
            client.emit("receivedprivatemsg", userJid, data.find("body").text);
        }else if(type === "is-typing"){
            client.emit("privatetyping", userJid, data.find("is-typing").attrs.val === "true");
        }else if(data.find("images")){
            let parseData = client.imgManager.parseAppData(data);
            let file_path = await client.imgManager.getImg(parseData.file_url, true, userJid,parseData.file_name);    
            client.emit("receivedprivateimg", userJid, file_path);
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
