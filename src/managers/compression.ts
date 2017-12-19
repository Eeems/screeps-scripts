import * as Compression from '../compression/';
import * as Serialization from '../serialization/';

interface Compressor{
    compress: (data: string) => string,
    decompress: (data: string) => string
}
interface Serializer{
    decode: (data: string) => any,
    encode: (data: any) => string
}

export class CompressionManager{
    public static compress(data: any, format: string = 'json'){
        const [serializer, compression] = CompressionManager.getFormat(format);
        return JSON.stringify([format, compression.compress(serializer.encode(data))]);
    }
    public static decompress(data: string){
        const [format, realData] = JSON.parse(data),
            [serializer, compression] = CompressionManager.getFormat(format);
        return serializer.decode(compression.decompress(realData));
    }
    private static getFormat(format: string): [Serializer, Compressor]{
        let serializer, compression;
        if(format.includes('+')){
            [serializer, compression] = format.split('+');
        }else{
            serializer = format;
        }
        if(!(serializer in Serialization)){
            serializer = 'json';
        }
        if(!compression || !(compression in Compression)){
            compression = 'none';
        }
        return [
            Serialization[serializer] as Serializer,
            Compression[compression] as Compressor
        ];
    }
}
