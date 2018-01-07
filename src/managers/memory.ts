import {Log} from '../log';
import * as config from '../config';
import {CompressionManager as compression} from './compression';

const shards = [
    'shard0',
    'shard1',
    'shard2'
];
let Mem: any = {
        segments: {},
        activeSegments: [], // limit 10
        interShardMutations: []
    },
    SharedMem: any = {
        shard: Game.shard.name
    };
const EmptyMemory = {
    creeps: {},
    spawns: {},
    flags: {},
    rooms: {},
    compressed: compression.compress(Mem, config.memory.format)
};

export class MemoryManager{
    public static get segments(): {[id: string]: any}{
        return Mem.segments;
    }
    public static get active(): number[]{
        return Mem.activeSegments;
    }
    public static setup(){
        Log.debug('Memory setup');
        this.loadCompressed();
        _.defaults(Memory, EmptyMemory)
        this.flush();
        this.saveCompressed();
        this.loadInterShard();
    }
    public static init(){
        Log.debug('Memory init');
        this.loadCompressed();
        this.flush();
        this.loadInterShard();
    }
    public static deinit(){
        Log.debug('Memory deinit');
        this.flush();
        this.gc();
        this.saveCompressed();
        this.saveInterShard();
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
        return compression.compress(Mem, config.memory.format);
    }
    public static activate(id: number){
        if(this.active.length < 10){
            this.active.push(id);
            return true;
        }
        return false;
    }
    public static deactivate(id: number){
        const i = this.active.indexOf(id);
        if(~i){
            this.active.splice(i, 1);
            return true;
        }
        return false;
    }
    public static interShardSet(prop: string | number, value: any){
        Mem.interShardMutations.push(['s', prop, value]);
    }
    public static interShardDelete(prop: string | number){
        Mem.interShardMutations.push(['d', prop]);
    }
    public static interShardGet(prop: string | number){
        return SharedMem[prop];
    }
    public static interShardHas(prop: string | number){
        return prop in SharedMem;
    }
    private static loadCompressed(){
        try{
            Mem = this.toJSON();
        }catch(e){
            Log.error(e);
            Log.panic('Failed to load compressed memory. Resetting.');
            Memory.compressed = EmptyMemory.compressed;
        }
    }
    private static saveCompressed(){
        Memory.compressed = this.toString();
    }
    private static loadInterShard(){
        SharedMem = JSON.parse(RawMemory.interShardSegment);
        _.each(Mem.interShardMutations, (mutation: any[]) => {
            const [action, prop] = mutation;
            if(action === 'd'){
                delete SharedMem[prop];
            }else if(action === 's'){
                SharedMem[prop] = mutation[2];
            }else{
                Log.warning(`Invalid intershard mutation: ${action}`);
            }
        });
    }
    private static saveInterShard(){
        if(SharedMem.shard === Game.shard.name){
            const i = shards.indexOf(Game.shard.name) + 1;
            SharedMem.shard = shards[i < shards.length ? i : 0];
            RawMemory.interShardSegment = JSON.stringify(SharedMem);
            Mem.interShardMutations = [];
        }
    }
    private static flush(){
        _.each(_.keys(this.segments), (id: number) => {
            if(~this.active.indexOf(id)){
                RawMemory.segments[id] = JSON.stringify(this.segments[id]);
                delete this.segments[id];
            }else if(!this.activate(id)){
                Log.warning(`Unable to automatically activate segment ${id} for flushing.`);
            }
        });
    }
}
