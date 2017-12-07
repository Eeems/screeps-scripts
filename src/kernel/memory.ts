import {createCodec, decode, encode} from 'msgpack-lite';
import * as lzstring from 'lz-string';
import C from '../kernel/constants';

const options = {
        codec: createCodec({
            binarraybuffer: true,
            preset: true,
            uint8array: true
        })
    },
    maxMemory = 2 * 1024 * 1024;
    // maxSegmentMemory = 100 * 1024;

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

export class MemoryBuffer{
    private _data: any;
    private _serializer: string;
    private _compression: string;
    static serializers = {
        json: {
            encode: JSON.stringify.bind(JSON),
            decode: JSON.parse.bind(JSON)
        },
        msgpack: {
            encode: (data) => uint8ToStr(encode(data, options)),
            decode: (data) => decode(strToUint8(data), options)
        }
    };
    static compression = {
        none: {
            compress: (data) => data,
            decompress: (data) => data
        },
        lzstring: {
            compress: (data) => lzstring.compressToUTF16(data),
            decompress: (data) => lzstring.decompressFromUTF16(data)
        }
    };
    public constructor(data?: string, format: string = 'json'){
        let [serializer, compression] = format.split('+');
        compression = compression || 'none';
        if(!MemoryBuffer.serializers[serializer]){
            throw new Error('Invalid serializer')
        }
        if(!MemoryBuffer.compression[compression]){
            throw new Error('Invalid compression');
        }
        this._serializer = serializer;
        this._compression = compression;
        if(data !== undefined){
            this.load(data);
        }
    }
    public get(key: string | number): any{
        if(this.has(key)){
            return this._data[key];
        }
    }
    public has(key: string | number): boolean{
        let valid;
        try{
            valid = key in this._data;
        }catch(e){
            valid = false;
        }
        return valid;
    }
    public set(key: string | number, val: any): void{
        try{
            this._data[key] = val;
        }catch(e){
            throw new Error(`Unable to set memory ${key}\n${e}`);
        }
    }
    public remove(key: string | number): void{
        delete this._data[key];
    }
    public defaults(data: any): void{
        this._data = _.defaults(this._data, data);
    }
    public defaultsDeep(data: any): void{
        this._data = _.defaultsDeep(this._data, data);
    }
    public from(data: string): void{
        const serializerFns = MemoryBuffer.serializers[this._serializer],
            compressionFns = MemoryBuffer.compression[this._compression];
        if(!serializerFns){
            throw new Error('Invalid serializer')
        }
        if(!compressionFns){
            throw new Error('Invalid compression');
        }
        try{
            this._data = serializerFns.decode(compressionFns.decompress(data));
        }catch(e){
            throw new Error(`Unable to load data with format: ${this._serializer}+${this._compression}\n${e}`);
        }
    }
    public load(data: any): void{
        this._data = data;
    }
    public toString(): string{
        const serializerFns = MemoryBuffer.serializers[this._serializer],
            compressionFns = MemoryBuffer.compression[this._compression];
        try{
            return compressionFns.compress(serializerFns.encode(this._data));
        }catch(e){
            throw new Error(`Unable to return data with format: ${this._serializer}+${this._compression}\n${e}`);
        }
    }
    public toJSON(): any{
        return this._data;
    }
}

namespace memory{
    export let data: MemoryBuffer = new MemoryBuffer(undefined, C.MEMORY_FORMAT);
    export function setup(): void{
        const mem = RawMemory.get();
        try{
            data.from(mem);
            if(typeof data.toJSON() !== 'object' && data != null){
                console.log('ERROR: Memory invalid.');
                reset();
            }
        }catch(e){
            console.log(`ERROR: Could not read memory.\n${e}`);
            console.log(mem);
            reset()
        }
    }
    export function init(): void{}
    export function deinit(): void{
        const memory = data.toString();
        if(memory.length > maxMemory){
            throw new Error('Memory filled');
        }
        RawMemory.set(memory);
    }
    export function activate(key: string | number): void{
        load(key);
    }
    export function load(key: string | number): any{
        !has(key) && set(key, {});
        return get(key);
    }
    export function get(key: string | number): any{
        return data.get(key);
    }
    export function set(key: string | number, val: any): void{
        data.set(key, val);
    }
    export function has(key: string | number): boolean{
        return data.has(key);
    }
    export function remove(key: string | number): void{
        data.remove(key);
    }
    export function defaults(d: any){
        data.defaults(d);
    }
    export function defaultsDeep(d: any){
        data.defaultsDeep(d);
    }
    export function reset(){
        console.log('Memory reset');
        data.load({});
    }
    export function getFreeMemory(){
        return maxMemory - getUsedMemory();
    }
    export function getUsedMemory(){
        return data.toString().length;
    }
}
export default memory;
