import {Log} from '../log';
import * as config from '../config';
import {CompressionManager as compression} from './compression';

const EmptyMemory = {
    creeps: {},
    spawns: {},
    flags: {},
    rooms: {},
    compressed: compression.compress({}, config.memory.format)
};

export class MemoryManager{
    public static setup(){
        Log.debug('Memory setup');
        this.loadFromRaw();
        _.defaults(Memory, EmptyMemory)
        this.saveToRaw();
    }
    public static init(){
        Log.debug('Memory init');
        this.loadFromRaw();
    }
    public static deinit(){
        Log.debug('Memory deinit');
        this.gc();
        this.saveToRaw();
    }
    public static reset(): void{
        RawMemory.set(JSON.stringify(EmptyMemory));
    }
    public static gc(){
        _.each(_.keys(Memory.creeps), (name) => {
            !Game.creeps[name] && delete Memory.creeps[name];
        });
        _.each(_.keys(Memory.rooms), (name) => {
            !Game.rooms[name] && delete Memory.rooms[name];
        });
        _.each(_.keys(Memory.flags), (name) => {
            !Game.flags[name] && delete Memory.flags[name];
        });
        _.each(_.keys(Memory.spawns), (name) => {
            !Game.spawns[name] && delete Memory.spawns[name];
        });
    }
    public static toJSON(): any{
        return compression.decompress(Memory.compressed);
    }
    public static toString(): string{
        return compression.compress(Memory.compressed, config.memory.format);
    }
    private static loadFromRaw(){
        try{
            Memory.compressed = this.toJSON();
        }catch(e){
            Log.error(e);
            Log.panic('Failed to load memory. Resetting');
            Memory.compressed = EmptyMemory.compressed;
        }
    }
    private static saveToRaw(){
        Memory.compressed = this.toString();
    }
}
