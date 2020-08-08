const fs = require("fs"),
    config = require("../config"),
    {blockhashData} = require("blockhash"),
    cryptoUtils = require("../cryptoUtils"),
    ffmpegSwitch = require("../ffmpegSwitch"),
    sharp = require("../noSharp"), //removed dependency on native module sharp
    axios = require("axios"),
    https = require("https");

class VideoManager {
    constructor(username, password, node, saveImages){
        this.username = username;
        this.password = password;
        this.saveImages = saveImages;
        this.senderJid = `${node}@talk.kik.com`;
        this.appId = "com.kik.ext.gallery";

        if(!fs.existsSync("./videos")){
            fs.mkdirSync("./videos");
        }
        if(!fs.existsSync(`./videos/${this.username}`)){
            fs.mkdirSync(`./videos/${this.username}`);
        }
        if(!fs.existsSync(`./videos/${this.username}/groups`)){
            fs.mkdirSync(`./videos/${this.username}/groups`);
        }
        if(!fs.existsSync(`./videos/${this.username}/private`)){
            fs.mkdirSync(`./videos/${this.username}/private`);
        }
    }
    async uploadVid(vidPath, version, logger, imgPath){
        imgPath = (typeof imgPath == "boolean")?undefined: imgPath;

        let ffmpret = ffmpegSwitch(vidPath, imgPath, logger);
        let vidBuffer = (await ffmpret).vidBuffer;


        // const out = await ffmpret.res.MEMFS[0];
        // console.log(`this that theng:\n ${out} `);

        const image = await sharp((await ffmpret).imgBuffer); //got rid of sharp, now supports loading image urls
        const buffer = await image.jpeg().toBuffer();
        const raw = await image.jpeg().raw().toBuffer({resolveWithObject: true});

        //video stuff
        const size = vidBuffer.byteLength;
        const md5 = cryptoUtils.bufferToMd5(vidBuffer);
        const vidSha1 = cryptoUtils.bufferToSha1(vidBuffer);

        //preview stuff
        const previewBase64 = buffer.toString("base64");
        const previewSha1 = cryptoUtils.bufferToSha1(buffer);
        const previewBlockhash = blockhashData({data: raw.data, height: raw.info.height, width: raw.info.width},
            16, 2);



        const contentId = cryptoUtils.generateUUID();
        const url = `https://platform.kik.com/content/files/${contentId}`;
        let respUrl;
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
            "x-kik-sha1-original": vidSha1.toUpperCase(),
            "x-kik-sha1-scaled": previewSha1.toUpperCase(),
            "x-kik-blockhash-scaled": previewBlockhash.toUpperCase(),
            "Content-Type": "video/mp4",
            "x-kik-content-extension": ".mp4"
        };
        // console.log(`headers:\n ${JSON.stringify(headers)}\ncontentID:\n${contentId}`);
        await axios.put(url, vidBuffer, {headers}).then(function(response) {
            // console.log(response.headers["content-location"]);
            respUrl = response.headers["content-location"];

        });
        return {contentId, size, previewBase64, previewSha1, previewBlockhash, respUrl};
    }
    //2nd param is used for determining which folder to save in
    getVid(url, isPrivate){
        const agent = new https.Agent({  
            rejectUnauthorized: false
        });
        //first request returns a 302 with a url
        https.get(url, { httpsAgent: agent }, (res) => {
            //second req returns the actual image
            https.get(res.headers.location, { httpsAgent: agent }, (res) => {
                let dataArr = [];

                res.on("data", (data) => {
                    dataArr.push(data);
                });
                res.on("end", () => {
                    let buffer = Buffer.concat(dataArr);
                    let date = new Date().toISOString().substring(0, 10);

                    if(this.saveImages){
                        if(isPrivate){
                            fs.writeFileSync(`./videos/${this.username}/private/${date}_${Date.now()}.mp4`, buffer);
                        }else{
                            fs.writeFileSync(`./videos/${this.username}/groups/${date}_${Date.now()}.mp4`, buffer);
                        }
                    }
                    return buffer;
                });

            }).on("error", (err) => {
                console.log("Error downloading video:");
                console.log(err);
            });

        }).on("error", (err) => {
            console.log("Error downloading video:");
            console.log(err);
        });
    }

    getGif(url, isPrivate){
        //hotfix for http video links
        axios.get(url, (res) => {
            let dataArr = [];

            res.on("data", (data) => {
                dataArr.push(data);
            });
            res.on("end", () => {
                let buffer = Buffer.concat(dataArr);
                let date = new Date().toISOString().substring(0, 10);

                if(this.saveImages){
                    if(isPrivate){
                        fs.writeFileSync(`./videos/${this.username}/private/${date}_${Date.now()}.mp4`, buffer);
                    }else{
                        fs.writeFileSync(`./videos/${this.username}/groups/${date}_${Date.now()}.mp4`, buffer);
                    }
                }
                return buffer;
            });

        }); 
        // .on("error", (err) => {
        //     console.log("Error downloading gif:");
        //     console.log(err);
        // });
    }

    
}
module.exports = VideoManager;