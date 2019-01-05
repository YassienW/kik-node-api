const fs = require("fs"),
    https = require("https")

class ImageManager {
    constructor(username, saveImages){
        this.username = username
        this.saveImages = saveImages

        if(!fs.existsSync(`./images/${this.username}/groups`)){
            fs.mkdirSync(`./images/${this.username}/groups`)
        }
        if(!fs.existsSync(`./images/${this.username}/private`)){
            fs.mkdirSync(`./images/${this.username}/private`)
        }
    }
    //2nd param is used for determining which folder to save in
    getImg(url, isPrivate){
        //first request returns a 302 with a url
        https.get(url, (res) => {
            //second req returns the actual image
            https.get(res.headers.location, (res) => {
                let dataArr = []

                res.on("data", (data) => {
                    dataArr.push(data)
                });
                res.on("end", () => {
                    let buffer = Buffer.concat(dataArr)
                    let date = new Date().toISOString().substring(0, 10)

                    if(this.saveImages){
                        if(isPrivate){
                            fs.writeFileSync(`./images/${this.username}/private/${date}_${Date.now()}.jpeg`, buffer)
                        }else{
                            fs.writeFileSync(`./images/${this.username}/groups/${date}_${Date.now()}.jpeg`, buffer)
                        }
                    }
                    return buffer
                });

            }).on("error", (err) => {
                console.log(err);
            });

        }).on("error", (err) => {
            console.log(err);
        });
    }
}
module.exports = ImageManager
