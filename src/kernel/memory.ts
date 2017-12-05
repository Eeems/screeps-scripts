import {createCodec, decode, encode} from 'msgpack-lite';

const options = {
    codec: createCodec({
        binarraybuffer: true,
        preset: true,
        uint8array: true
    })
};

export class MemoryBuffer{
    private _data: any;
    public constructor(data?: string){
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
        this._data[key] = val;
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
        const uint = new Uint8Array(data.length);
        for(let i=0, j = data.length; i<j; ++i){
            uint[i] = data.charCodeAt(i);
        }
        try{
            this._data = decode(uint, options);
        }catch(e){
            console.log('Error trying to decode buffer: ' + e);
        }
    }
    public load(data: any): void{
        this._data = data;
    }
    public toString(): string{
        const uint = encode(this._data, options);
        let str = '';
        for(let i=0, j = uint.length; i<j; ++i){
            str += String.fromCharCode(uint[i]);
        }
        return str;
    }
    public toJSON(): any{
        return this._data;
    }
}

namespace memory{
    export let data: MemoryBuffer = new MemoryBuffer();
    export function setup(): void{
        data.from(RawMemory.get());
        if(typeof data.toJSON() !== 'object'){
            reset();
        }
    }
    export function init(): void{}
    export function deinit(): void{
        RawMemory.set(data.toString());
    }
    export function activate(key: string | number): void{
        load(key);
    }
    export function load(key): any{
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
        data.load({});
    }
}
export default memory;
