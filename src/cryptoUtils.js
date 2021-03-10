const crypto = require("crypto"),
    uuidv4 = require("uuid/v4"),
    converter = require("hex2dec"),
    bigInt = require("big-integer"),
    cryptoUtils = module.exports;

cryptoUtils.generatePasskey = (username, password) => {
    let sha1Password = crypto.createHash("sha1").update(password).digest("hex");
    let salt = username.toLowerCase() + "niCRwL7isZHny24qgLvy";
    return crypto.pbkdf2Sync(sha1Password, salt, 8192, 16, "sha1").toString("hex");
};
cryptoUtils.generateUUID = () => {
    let uuid = uuidv4();
    //remove the dashes
    let bytes = Buffer.from(uuid.replace(/-/g, ""), "hex");
    let msb = bigInt(converter.hexToDec(bytes.slice(0, 8).toString("hex")));
    let lsb = bigInt(converter.hexToDec(bytes.slice(8).toString("hex")));

    let iArr = [[3, 6], [2, 5], [7, 1], [9, 5]];
    let i2 = bigInt("-1152921504606846976").and(msb).shiftRight(62);
    let i3 = iArr[i2][0];
    i2 = iArr[i2][1];
    let j = msb.and(-16777216).shiftRight(22).xor(msb.and(16711680).shiftRight(16)).xor(msb.and(65280).shiftRight(8));
    i2 = UUIDSubFunc(msb, i2).plus(1).or(UUIDSubFunc(msb, i3).shiftLeft(1));

    let k = 1;
    for(let i = 0; i < 6; i++){
        k = (k + (i2 * 7)) % 60;
        lsb = lsb.and(bigInt(1).shiftLeft(k + 2).xor(-1)).or((UUIDSubFunc(j, i).shiftLeft(k + 2)));
    }
    let final = converter.decToHex(msb.toString(), {prefix: false}) + converter.decToHex(lsb.toString(),
        {prefix: false});
    return `${final.slice(0, 8)}-${final.slice(8, 12)}-${final.slice(12,16)}-${final.slice(16, 20)}-${final.slice(20)}`;
};

// only needed for "k" stanza
cryptoUtils.makeKikTimestamp = () => {
    let j = new Date().getTime();
    let j2 = (((j & 65280) >> 8) ^ ((j & 16711680) >> 16) ^ ((j & -16777216) >> 24)) & 30;
    let j3 = (j & 224) >> 5;
	
    if (j2 % 4 === 0) {
        j3 = Math.floor(j3 / 3) * 3;
    } else {
        j3 = Math.floor(j3 / 2) * 2;
    }
	
    let bigInt2 = bigInt(j2);
    let bigInt3 = bigInt(j3).shiftLeft(5);
    let bigInt4 = bigInt(j).and(-255);

    return bigInt4.or(bigInt3).or(bigInt2).toString();
};

//used internally only, the values received here have to be of type bigInt
function UUIDSubFunc(i, j) {
    if (bigInt(j).compare(32) === 1) {
        return i.shiftRight(32).and(bigInt(1).shiftLeft(j)).shiftRight(j);
    }
    return bigInt(1).shiftLeft(j).and(i).shiftRight(j);
}
cryptoUtils.generateCV = (versionInfo, timestamp, jid) => {
    let apkSignatureHex =
        "308203843082026CA00302010202044C23D625300D06092A864886F70D0101050500308183310B3009060355" +
        "0406130243413110300E060355040813074F6E746172696F3111300F0603550407130857617465726C6F6F31" +
        "1D301B060355040A13144B696B20496E74657261637469766520496E632E311B3019060355040B13124D6F62" +
        "696C6520446576656C6F706D656E74311330110603550403130A43687269732042657374301E170D31303036" +
        "32343232303331375A170D3337313130393232303331375A308183310B30090603550406130243413110300E" +
        "060355040813074F6E746172696F3111300F0603550407130857617465726C6F6F311D301B060355040A1314" +
        "4B696B20496E74657261637469766520496E632E311B3019060355040B13124D6F62696C6520446576656C6F" +
        "706D656E74311330110603550403130A4368726973204265737430820122300D06092A864886F70D01010105" +
        "000382010F003082010A0282010100E2B94E5561E9A2378B657E66507809FB8E58D9FBDC35AD2A2381B8D4B5" +
        "1FCF50360482ECB31677BD95054FAAEC864D60E233BFE6B4C76032E5540E5BC195EBF5FF9EDFE3D99DAE8CA9" +
        "A5266F36404E8A9FCDF2B09605B089159A0FFD4046EC71AA11C7639E2AE0D5C3E1C2BA8C2160AFA30EC8A0CE" +
        "4A7764F28B9AE1AD3C867D128B9EAF02EF0BF60E2992E75A0D4C2664DA99AC230624B30CEA3788B23F5ABB61" +
        "173DB476F0A7CF26160B8C51DE0970C63279A6BF5DEF116A7009CA60E8A95F46759DD01D91EFCC670A467166" +
        "A9D6285F63F8626E87FBE83A03DA7044ACDD826B962C26E627AB1105925C74FEB77743C13DDD29B55B31083F" +
        "5CF38FC29242390203010001300D06092A864886F70D010105050003820101009F89DD384926764854A4A641" +
        "3BA98138CCE5AD96BF1F4830602CE84FEADD19C15BAD83130B65DC4A3B7C8DE8968ACA5CDF89200D6ACF2E75" +
        "30546A0EE2BCF19F67340BE8A73777836728846FAD7F31A3C4EEAD16081BED288BB0F0FDC735880EBD8634C9" +
        "FCA3A6C505CEA355BD91502226E1778E96B0C67D6A3C3F79DE6F594429F2B6A03591C0A01C3F14BB6FF56D75" +
        "15BB2F38F64A00FF07834ED3A06D70C38FC18004F85CAB3C937D3F94B366E2552558929B98D088CF1C45CDC0" +
        "340755E4305698A7067F696F4ECFCEEAFBD720787537199BCAC674DAB54643359BAD3E229D588E324941941E" +
        "0270C355DC38F9560469B452C36560AD5AB9619B6EB33705";
    let keySource = "hello" + Buffer.from(apkSignatureHex, "hex").toString("binary") + versionInfo.version +
        versionInfo.sha1Digest + "bar";
    let hmacKey = crypto.createHash("sha1").update(keySource, "ascii").digest("base64");
    let hmacData = timestamp + ":" + jid;
    return crypto.createHmac("sha1", hmacKey).update(hmacData).digest("hex");
};
cryptoUtils.generateSignature = (kikVersion, timestamp, jid, sid) => {
    let privateKeyPem = "-----BEGIN RSA PRIVATE KEY-----\nMIIBPAIBAAJBANEWUEINqV1KNG7Yie9GSM8t75ZvdTeqT7kOF40kvDHIp" +
        "/C3tX2bcNgLTnGFs8yA2m2p7hKoFLoxh64vZx5fZykCAwEAAQJAT" +
        "/hC1iC3iHDbQRIdH6E4M9WT72vN326Kc3MKWveT603sUAWFlaEa5T80GBiP/qXt9PaDoJWcdKHr7RqDq" +
        "+8noQIhAPh5haTSGu0MFs0YiLRLqirJWXa4QPm4W5nz5VGKXaKtAiEA12tpUlkyxJBuuKCykIQbiUXHEwzFYbMHK5E" +
        "/uGkFoe0CIQC6uYgHPqVhcm5IHqHM6/erQ7jpkLmzcCnWXgT87ABF2QIhAIzrfyKXp1ZfBY9R0H4pbboHI4uatySKc" +
        "Q5XHlAMo9qhAiEA43zuIMknJSGwa2zLt/3FmVnuCInD6Oun5dbcYnqraJo=\n-----END RSA PRIVATE KEY----- ";

    let data = crypto.createHash("sha256").update(`${jid}:${kikVersion}:${timestamp}:${sid}`).digest("hex");
    let out = crypto.createSign("RSA-SHA1").update(data).sign(privateKeyPem, "base64");
	
	// Kik expects a base64 url encoding with no padding
	out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, "");
	
	return out;
};

//receives an object and sorts it according to kik's sekrit crypto algorithms then returns it as JS object
//if the object i return doesn't preserve order, i could return JSON instead
cryptoUtils.sortPayload = (object) => {
    let map = new Map(Object.entries(object));
    let originalLength = map.size;
    let keys = [...map.keys()];
    keys.sort();
    let outputMap = new Map();

    for (let i = 0; i < originalLength; i++){
        let hashCode = payloadHash(map);
        hashCode = (hashCode > 0? hashCode % map.size : hashCode % -map.size);
        if (hashCode < 0){
            hashCode += map.size;
        }
        let selectedKey = keys[hashCode];
        keys.splice(hashCode, 1);
        outputMap.set(selectedKey, map.get(selectedKey));
        map.delete(selectedKey);
    }
    //empty object before filling it up with the new order
    object = {};
    outputMap.forEach((v, k) => {
        object[k] = v;
    });
    return object;
};
function payloadHash(map) {
    let keys = [...map.keys()];
    keys.sort();
    let string1 = "";
    for(let key in keys){
        string1 += keys[key] + map.get(keys[key]);
    }
    keys.reverse();
    let string2 = "";
    for(let key in keys){
        string2 += keys[key] + map.get(keys[key]);
    }

    let arr = [hashSubfunction(0, string1), hashSubfunction(1, string1), hashSubfunction(2, string1),
        hashSubfunction(0, string2), hashSubfunction(1, string2), hashSubfunction(2, string2)];
    let hashBase = -1964139357;
    let hashOffset = 7;
    return (((hashBase ^ (arr[0] << hashOffset)) ^ (arr[5] << (hashOffset * 2))) ^ (arr[1] << hashOffset)) ^ arr[0];
}
function hashSubfunction(hashId, bytes){
    let j = 0,  buffer;
    if(hashId === 0){
        buffer = crypto.createHash("sha256").update(bytes).digest();
    }else if(hashId === 1){
        buffer = crypto.createHash("sha1").update(bytes).digest();
    }else{
        buffer = crypto.createHash("md5").update(bytes).digest();
    }
    for (let i = 0; i < buffer.length; i+=4){
        j ^= ((((byteToSignedInt(buffer[i + 3])) << 24) | ((byteToSignedInt(buffer[i + 2])) << 16)) |
            ((byteToSignedInt(buffer[i + 1])) << 8)) | (byteToSignedInt(buffer[i]));
    }
    return j;
}
function byteToSignedInt(byte){
    if (byte > 127){
        return (256 - byte) * -1;
    }
    return byte;
}

cryptoUtils.generateImageVerification = (contentId, appId) => {
    const salt = "YA=57aSA!ztajE5";
    return crypto.createHash("sha1").update(`${salt}${contentId}${appId}`).digest("hex");
};
cryptoUtils.bufferToSha1 = (buffer) => {
    return crypto.createHash("sha1").update(buffer).digest("hex");
};
cryptoUtils.bufferToMd5 = (buffer) => {
    return crypto.createHash("md5").update(buffer).digest("hex");
};



