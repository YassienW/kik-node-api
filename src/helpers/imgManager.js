const fs = require("fs"),
    config = require("../config"),
    {blockhashData} = require("blockhash"),
    cryptoUtils = require("./cryptoUtils"),
    sharp = require("sharp"),
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
    async uploadImg(imgPath){
        const image = sharp(imgPath);
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
            "User-Agent": `Kik/${config.kikVersionInfo.version} (Android 7.1.2) Content`,
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
    parseAppData(data) {
        let file_url="";
        let file_name="fu.png";
        //Logger.log("info", `Received data from app: (${data.find("app-name").text})`);
        //console.log(`Received data from app: (${data.find("app-name").text})`);
        if ((data.find("app-name").text=="Gallery") || (data.find("app-name").text=="Camera")) {
            file_url=data.find("file-url").text;
            file_name=data.find("file-name").text
        } else if (data.find("app-name").text=="GIF") {
            file_url=data.find("uris").find("uri").text;
            file_name=data.find("uris").find("uri").attrs["file-content-type"].replace("/",".");
        } else if (data.find("app-name").text=="Stickers") {
            let tmp_elements=data.find("extras").findAll("item");
            for (let i in tmp_elements) {
                let element=tmp_elements[i];
                if (element.find("key").text=="sticker_url") { // Probably a Array.Find would work too
                    file_url=element.find("val").text;
                    let tmp_urlparts=file_url.split("/");
                    file_name=tmp_urlparts[tmp_urlparts.length-1];
                }
            }
        }
        else if (data.find("app-name").text=="Sketch") {
            let tmp_elements=data.find("extras").findAll("item");
            for (let i in tmp_elements) {
                let element=tmp_elements[i];
                if (element.find("key").text=="jsonData") { // Probably a Array.Find would work too
                    let jsonData = JSON.parse(element.find("val").text);
                    file_url=jsonData.image;
                    file_name="i_dont_see_it.png";
                }
            }
        }
        else if (data.find("app-name").text=="Memes") {
            // Sorry i dont get it!
        }

        if (file_url=="") {
            //Logger.log("error", `Unknown App!?`);
            //console.error(`Unknown App!?`);
            //process.exit(1);
        }
        //console.log("file_url: ", file_url);
        //console.log("file_name: ", file_name);
        return {"file_url": file_url, "file_name": file_name};
    }
    async getImg(url, isPrivate, source, file_name){
        return new Promise((resolve, reject) => {
            //first request returns a 302 with a url
            https.get(url, async (res) => {
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
                            // ToDo: It should probably be files not images, because its possible to get videos^^
                            let imageDirectory = `./images/${this.username}`;

                            if(isPrivate){
                                imageDirectory += "/private";
                            }else{
                                imageDirectory += "/groups";
                            }
                            imageDirectory += `/${source}`;
                            //make sure the directory exists, if not create it
                            if(!fs.existsSync(imageDirectory)){
                                fs.mkdirSync(imageDirectory);
                            }
                            let tmp_arr = file_name.split(".");
                            let file_extension=tmp_arr[tmp_arr.length-1];
                            let file_path=`${imageDirectory}/${date}_${Date.now()}.${file_extension}`;
                            fs.writeFileSync(file_path, buffer);
                            resolve(file_path);
                        } else {
                            resolve();
                        }
                    });
                }).on("error", (err) => {
                    console.log("Error downloading image:");
                    console.log(err);
                    reject();
                });

            }).on("error", (err) => {
                console.log("Error downloading image:");
                console.log(err);
                reject();
            });
            
        });
    }
}
module.exports = ImageManager;
