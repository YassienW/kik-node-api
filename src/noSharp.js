const Jimp = require("jimp");

//remapped Jimp functions to match sharp.
let sharp = async (imgPath) => { 
    let img;

    await Jimp.read(imgPath).then(async image => {
        img = image;
    });


    const _process = (MIME) => ({
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
    });

    let jpeg = _process(Jimp.MIME_JPEG);
    let png = _process(Jimp.MIME_PNG);

    return {
        jpeg: () => {return jpeg;},
        png: () => {return png;}
    };
};

module.exports = sharp;
