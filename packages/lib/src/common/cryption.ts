import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// 生成uuid 32位字符串
export const idGenetator = () => {
    return uuidv4().replace(/-/g, '');
}


// md5加密
export const cryptoMd5 = (str: string, salt: string = 'yujian9527', iterations: number = 3) => {
    let result = str;
    for (let i = 0; i < iterations; i++) {
        result += salt;
        result = CryptoJS.MD5(result).toString();
    }
    return result;
}

// base64加密
export const encodeBase64 = (str: string, salt: string = 'yujian9527', iterations: number = 3) => {
    let result = str;
    for (let i = 0; i < iterations; i++) {
        result += salt;
        result = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(result));
    }
    return result;
}

// base64解密
export const decodeBase64 = (str: string, salt: string = 'yujian9527', iterations: number = 3) => {
    let result = str;
    for (let i = 0; i < iterations; i++) {
        result = CryptoJS.enc.Base64.parse(result).toString(CryptoJS.enc.Utf8);
        if (result.endsWith(salt)) {
            result = result.substring(0, result.length - salt.length);
        } else {
            throw new Error("Invalid salt or corrupted data");
        }
    }
    return result;
}

// sha256加密
export const encodeSha256 = (str: string) => {
    return CryptoJS.SHA256(str).toString();
}

// sha256解密
export const decodeSha256 = (str: string) => {
    return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
}