const fs = require("fs"),
    config = require("../config"),
    {blockhashData} = require("blockhash"),
    cryptoUtils = require("../cryptoUtils"),
    sharp = require("../noSharp"), //removed dependency on native module sharp
    axios = require("axios"),
    https = require("https");

class ImageManager {
    constructor(username, password, node, saveImages){
        this.username = username;
        this.password = password;
        this.saveImages = saveImages;
        this.senderJid = `${node}@talk.kik.com`;
        this.appId = "com.kik.ext.gallery";

        if(!fs.existsSync("./images")){
            fs.mkdirSync("./images");
        }
        if(!fs.existsSync(`./images/${this.username}`)){
            fs.mkdirSync(`./images/${this.username}`);
        }
        if(!fs.existsSync(`./images/${this.username}/groups`)){
            fs.mkdirSync(`./images/${this.username}/groups`);
        }
        if(!fs.existsSync(`./images/${this.username}/private`)){
            fs.mkdirSync(`./images/${this.username}/private`);
        }
    }
    async uploadImg(imgPath, version){
        const image = await sharp(imgPath); //got rid of sharp, now supports loading image urls
        const buffer = await image.jpeg().toBuffer();
        const raw = await image.jpeg().raw().toBuffer({resolveWithObject: true});

        const size = buffer.byteLength;
        const md5 = cryptoUtils.bufferToMd5(buffer);
        const sha1 = cryptoUtils.bufferToSha1(buffer);
        const previewBase64 = buffer.toString("base64");
        const previewSha1 = cryptoUtils.bufferToSha1(buffer);
        const previewBlockhash = blockhashData({data: raw.data, height: raw.info.height, width: raw.info.width},
            16, 2);

        const contentId = cryptoUtils.generateUUID();
        const url = `https://platform.kik.com/content/files/${contentId}`;
        const headers = {
            "Host": "platform.kik.com",
            "Connection": "Keep-Alive",
            "Content-Length": size,
            "User-Agent": `Kik/${config(version).kikVersionInfo.version} (Android 10.0.0) Content`,
            "x-kik-jid": this.senderJid,
            "x-kik-password": cryptoUtils.generatePasskey(this.username, this.password),
            "x-kik-verification": cryptoUtils.generateImageVerification(contentId, this.appId),
            "x-kik-app-id": this.appId,
            "x-kik-content-chunks": "1",
            "x-kik-content-size": size,
            "x-kik-content-md5": md5,
            "x-kik-chunk-number": "0",
            "x-kik-chunk-md5": md5,
            "x-kik-sha1-original": sha1.toUpperCase(),
            "x-kik-sha1-scaled": previewSha1.toUpperCase(),
            "x-kik-blockhash-scaled": previewBlockhash.toUpperCase(),
            "Content-Type": "image/jpeg",
            "x-kik-content-extension": ".jpg"
        };
        await axios.put(url, buffer, {headers});
        return {contentId, size, sha1, previewSha1, previewBlockhash, previewBase64};
    }
    //2nd param is used for determining which folder to save in
    getImg(url, isPrivate){
        //first request returns a 302 with a url
        https.get(url, (res) => {
            //second req returns the actual image
            https.get(res.headers.location, (res) => {
                let dataArr = [];

                res.on("data", (data) => {
                    dataArr.push(data);
                });
                res.on("end", () => {
                    let buffer = Buffer.concat(dataArr);
                    let date = new Date().toISOString().substring(0, 10);

                    if(this.saveImages){
                        if(isPrivate){
                            fs.writeFileSync(`./images/${this.username}/private/${date}_${Date.now()}.jpeg`, buffer);
                        }else{
                            fs.writeFileSync(`./images/${this.username}/groups/${date}_${Date.now()}.jpeg`, buffer);
                        }
                    }
                    return buffer;
                });

            }).on("error", (err) => {
                console.log("Error downloading image:");
                console.log(err);
            });

        }).on("error", (err) => {
            console.log("Error downloading image:");
            console.log(err);
        });
    }
}
module.exports = ImageManager;