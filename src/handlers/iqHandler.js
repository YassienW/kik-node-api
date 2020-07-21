module.exports = (client, callbacks, id, data) => {
    let xmlns = data.find("query").attrs.xmlns;

    //get undefined subvales without error
    function getSafe(fn, defaultVal) {
        try {
            return fn();
        } catch (e) {
            return defaultVal;
        }
    }

    if (xmlns === "jabber:iq:register") {
        if (data.find("node")) {
            client.setNode(data.find("node").text);
        } else if (data.find("captcha-url")) {
            client.emit("receivedcaptcha", data.find("captcha-url").text);
        } else {
            //handle others
        }
    } else if (xmlns === "jabber:iq:roster") {
        let groups = [],
            friends = [];
        //fill up friends
        data.findAll("item").forEach(friend => {
            friends.push({
                jid: friend.attrs.jid,
                username: friend.find("username").text,
                displayName: friend.find("display-name").text
            });
        });
        //fill up groups
        data.findAll("g").forEach(group => {
            let users = [];
            group.findAll("m").forEach((user) => {
                users.push(user.text);
            });
            groups.push({
                jid: group.attrs.jid,
                code: group.find("code") ? group.find("code").text : null,
                name: group.find("n") ? group.find("n").text : null,
                users: users
            });
        });
        //trigger event and send callback if registered
        client.emit("receivedroster", groups, friends);
        let callback = callbacks.get(id);
        if (callback) {
            callback(groups, friends);
            callbacks.delete(id);
        }
    } else if (xmlns === "kik:iq:friend:batch") {
        let users = [];
        data.findAll("item").forEach(user => {
            //slightly better fix for "(user.find("username").t͟e͟x͟t͟ does not exist)" bug 
            users.push({
                jid: user.attrs.jid,
                // username: typeof (user.find("username").text) === "undefined" ? null : user.find("username").text,
                username: getSafe(() => user.find("username").text) === "Username unavailable" ? 
                    "Username unavailable" : getSafe(() => user.find("username").text) === undefined ? 
                        null : getSafe(() => user.find("username").text),
                // displayName: user.find("display-name").text,
                displayName: getSafe(() => user.find("display-name").text) != 
                    undefined ? user.find("display-name").text : null,
                //sometimes, when you are the user there is no pic (maybe there are other cases idk)
                pic: user.find("pic") ? user.find("pic").text : null
            });
        });
        //trigger event and send callback if registered
        client.emit("receivedjidinfo", users);
        let callback = callbacks.get(id);
        if (callback) {
            callback(users);
            callbacks.delete(id);
        }
    }
};
