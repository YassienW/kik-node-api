const axios = require("axios");

// placeholder image url
let textData = "https://via.placeholder.com/150/FFFFFF/000000/fff.jpg?text=Gallery";
let vidBuffer;
let imgBuffer;
let res;

module.exports = async (vidPath, imgPath = textData, logger) => {

    let _switch = !(Buffer.isBuffer(vidPath))? 
        async ()=> {

            await axios
                .get(vidPath, {
                    responseType: "arraybuffer"
                })
                .then(response => vidBuffer = Buffer.from(response.data, "binary"));

            //if the switch does not receive a video buffer and image buffer 
            //a placeholder image is used for preview
            await axios
                .get(imgPath, {
                    responseType: "arraybuffer"
                })
                .then(response => imgBuffer = Buffer.from(response.data, "binary"));
            console.log(vidBuffer);
        }:((typeof vidPath !=  "string"))?
            ()=>{ 
                //use buffers if both
                vidBuffer = vidPath;
                imgBuffer = imgPath;
            }:()=>{ 
                logger.log("error", "Invalid video input, this may be catastrophic, "+ 
            "untested if it is let me know");
            };
    await _switch();

    return {res: res, vidBuffer: vidBuffer, imgBuffer: imgBuffer};
};

