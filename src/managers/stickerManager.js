const fs = require("fs"),
    cryptoUtils = require("../cryptoUtils"),
    sharp = require("../noSharp"); //removed dependency on native module sharp

class ImageManager {
    constructor(username, password, node, saveImages){
        this.username = username;
        this.password = password;
        this.saveImages = saveImages;
        this.senderJid = `${node}@talk.kik.com`;
        this.appId = "com.kik.ext.gallery";

        if(!fs.existsSync("./stickers")){
            fs.mkdirSync("./stickers");
        }
        if(!fs.existsSync(`./stickers/${this.username}`)){
            fs.mkdirSync(`./stickers/${this.username}`);
        }
        if(!fs.existsSync(`./stickers/${this.username}/groups`)){
            fs.mkdirSync(`./stickers/${this.username}/groups`);
        }
        if(!fs.existsSync(`./stickers/${this.username}/private`)){
            fs.mkdirSync(`./stickers/${this.username}/private`);
        }
    }
    async uploadImg(imgPath){
        const image = await sharp(imgPath); //got rid of sharp, now supports loading image urls
        const buffer = await image.png().toBuffer();

        const previewBase64 = buffer.toString("base64");

        const contentId = cryptoUtils.generateUUID();
        const url = `https://platform.kik.com/content/files/${contentId}`;
        // await axios.put(url, buffer, {headers});
        return {contentId, previewBase64, url};
    }
    //2nd param is used for determining which folder to save in
    getImg(b64, isPrivate){
        let buffer = Buffer.from(b64, "base64");
        let date = new Date().toISOString().substring(0, 10);

        if(this.saveImages){
            if(isPrivate){
                fs.writeFileSync(`./stickers/${this.username}/private/${date}_${Date.now()}.png`, buffer);
            }else{
                fs.writeFileSync(`./stickers/${this.username}/groups/${date}_${Date.now()}.png`, buffer);
            }
        }


    }
}
module.exports = ImageManager;