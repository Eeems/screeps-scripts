import {encode, decode} from 'msgpack-lite';

export let data = {};
export function load(source: string | undefined){
    if(source === undefined){
        source = RawMemory.get();
    }
    data = decode(source);
    return data;
}
export function raw(){
    return encode(data);
}
export function save(){
    RawMemory.set(raw())
}
export function get(){
    return data;
}
