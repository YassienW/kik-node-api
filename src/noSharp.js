const Jimp = require("jimp");

//remapped Jimp functions to match sharp.
let sharp = async (imgPath) => {
    let img;
    await Jimp.read(imgPath).then(async image => {
        img = image;
    });
    return {
        jpeg: (MIME = Jimp.MIME_JPEG) => ({
            toBuffer: () => {
                return img.getBufferAsync(MIME);
            },
            raw: () => ({
                toBuffer: async () => ({
                    info: {
                        height: img.bitmap.height,
                        width: img.bitmap.width
                    },
                    data: img.bitmap.data.toString(),
                }),
            })
        })
    };
};


module.exports = sharp;


// //quick testing implementation
// let kat = "https://homepages.cae.wisc.edu/~ece533/images/airplane.png";

// async function uploadImg(imgPath) {
//     // const image = sharp(imgPath);
//     const image = await sharp(imgPath);

//     const buffer = await image.jpeg().toBuffer();
//     const raw = await image.jpeg().raw().toBuffer({
//         resolveWithObject: true
//     });
//     console.log(`buffer:\n ${JSON.stringify(buffer)}\nraw:\n${raw}`);
//     // console.log(`data:\n ${raw.data}\nheight:\n ${raw.info.height}\nwidth:\n ${raw.info.width}`);
// }
// // uploadImg(kat);
