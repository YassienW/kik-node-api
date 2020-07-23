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
        }),
        png: (MIME = Jimp.MIME_PNG) => ({
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
