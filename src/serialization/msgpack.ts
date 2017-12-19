import {createCodec, decode, encode} from 'msgpack-lite';

const options = {
    codec: createCodec({
        binarraybuffer: true,
        preset: true,
        uint8array: true
    })
};

function uint8ToStr(uint: Uint8Array): string{
    let str = '';
    for(let i=0, j = uint.length; i<j; ++i){
        str += String.fromCharCode(uint[i]);
    }
    return str;
}
function strToUint8(str: string): Uint8Array{
    const uint = new Uint8Array(str.length);
    for(let i=0, j = str.length; i<j; ++i){
        uint[i] = str.charCodeAt(i);
    }
    return uint;
}

export default {
    decode: (data) => decode(strToUint8(data), options),
    encode: (data) => uint8ToStr(encode(data, options))
};
