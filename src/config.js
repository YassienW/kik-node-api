const versinList = { //version list Courtesy tomer8007/kik-bot-api-unofficial
    14: {
        "kik_version": "14.0.0.11130",
        "classes_dex_sha1_digest": "9nPRnohIOTbby7wU1+IVDqDmQiQ="
    },
    14.5: {
        "kik_version": "14.5.0.13136",
        "classes_dex_sha1_digest": "LuYEjtvBu4mG2kBBG0wA3Ki1PSE="
    },
    15: {
        "kik_version": "15.21.0.22201",
        "classes_dex_sha1_digest": "MbZ+Zbjaz5uFXKFDM88CwFh7DAg="
    },
    15.25: {
        "kik_version": "15.25.0.22493",
        "classes_dex_sha1_digest": "pNtboj79GGFYk9w2RbZZTxLpZUY="
    }
};

let config = (versionNumb = 15.25) => ({
    kikVersionInfo: {
        version: versinList[versionNumb].kik_version,
        sha1Digest: versinList[versionNumb].classes_dex_sha1_digest,
    }
});

module.exports = config;