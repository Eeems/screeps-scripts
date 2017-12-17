import * as lzstring from 'lz-string';
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

export class CompressionManager{
    public static serializers = {
        json: {
            decode: JSON.parse.bind(JSON),
            encode: JSON.stringify.bind(JSON)
        },
        msgpack: {
            decode: (data) => decode(strToUint8(data), options),
            encode: (data) => uint8ToStr(encode(data, options))
        }
    };
    public static compression = {
        lzstring: {
            compress: (data) => lzstring.compressToUTF16(data),
            decompress: (data) => lzstring.decompressFromUTF16(data)
        },
        none: {
            compress: (data) => data,
            decompress: (data) => data
        }
    };
    public static compress(data: any, format: string = 'json'){
        const [serializer, compression] = CompressionManager.getFormat(format);
        return JSON.stringify([format, compression.compress(serializer.encode(data))]);
    }
    public static decompress(data: string){
        const [format, realData] = JSON.parse(data),
            [serializer, compression] = CompressionManager.getFormat(format);
        return serializer.decode(compression.decompress(realData));
    }
    private static getFormat(format: string){
        let serializer, compression;
        if(format.includes('+')){
            [serializer, compression] = format.split('+');
        }else{
            serializer = format;
        }
        return [
            CompressionManager.serializers[serializer],
            CompressionManager.compression[compression || 'none']
        ];
    }
}
