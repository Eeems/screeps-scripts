import {encode, decode, createCodec} from 'msgpack-lite';

const codec = createCodec({
        binarraybuffer: true,
        preset: true,
        uint8array: true
    }),
    options = {
        codec: codec
    };

export class MemoryBuffer{
    private _data: any;
    public constructor(data?: string){
        data !== undefined && this.load(data);
    }
    public get(key: string | number): any{
        return this._data[key];
    }
    public has(key: string | number): boolean{
        return key in this._data;
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
        let uint = new Uint8Array(data.length);
        for(let i=0, j = data.length; i<j; ++i){
            uint[i] = data.charCodeAt(i);
        }
        try{
            let newData = decode(uint, options);
            this._data = newData;
        }catch(e){
            console.log('Error trying to decode buffer: ' + e);
        }
    }
    public load(data: any): void{
        this._data = data;
    }
    public toString(): string{
        let uint = encode(this._data, options),
            str = '';
        for(let i=0, j = uint.length; i<j; ++i){
            str += String.fromCharCode(uint[i]);
        }
        return str;
    }
    public toJSON(): any{
        return this._data;
    }
};

module memory{
    export let data: MemoryBuffer = new MemoryBuffer();
    export function load(): void{
        let raw = RawMemory.get();
        data.from(raw);
    }
    export function from(newData: string){
        data.from(newData);
    }
    export function save(): void{
        RawMemory.set(data.toString());
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
    export function ensure(){
        if(typeof data.toJSON() !== 'object'){
            data.load({});
            console.log('Rebuilding memory');
        }
        if(!data.has('processes')){
            data.set('processes', []);
            console.log('Process table missing. Rebuilding.');
        }
        if(!data.has('ram')){
            data.set('ram', {});
            console.log('RAM entries missing. Rebuilding.');
        }
    }
}
export default memory;
