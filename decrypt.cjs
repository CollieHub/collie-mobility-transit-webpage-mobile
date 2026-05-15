const fs = require('fs');
const crypto = require('crypto');
const GEO_SECRET_FRAGMENT_1 = 'SIT-ZARATE-X9Z8-';
const GEO_SECRET_FRAGMENT_2 = '2026-KD82-V2';
const getGeoKey = () => GEO_SECRET_FRAGMENT_1 + GEO_SECRET_FRAGMENT_2;
function base64ToBuf(base64) {
    return Buffer.from(base64, 'base64');
}
const base64Payload = JSON.parse(fs.readFileSync('./public/data/transit-data.json')).data;
const combined = base64ToBuf(base64Payload);
const iv = combined.subarray(0, 12);
const encDataWithTag = combined.subarray(12);
const keyData = Buffer.from(getGeoKey().padEnd(32, '0').slice(0, 32));
const decipher = crypto.createDecipheriv('aes-256-gcm', keyData, iv);
const tag = encDataWithTag.subarray(encDataWithTag.length - 16);
const encData = encDataWithTag.subarray(0, encDataWithTag.length - 16);
decipher.setAuthTag(tag);
let dec = decipher.update(encData);
dec = Buffer.concat([dec, decipher.final()]);
const data = JSON.parse(dec.toString('utf8'));
console.log(JSON.stringify(data.routes[0], null, 2));
