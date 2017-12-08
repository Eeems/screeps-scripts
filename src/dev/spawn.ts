import C from '../kernel/constants';
import { FS } from '../kernel/fs';
import { default as memory } from '../kernel/memory';

const spawns = {};

// function uid(){
//     return Math.random().toString(36).substring(7);
// }

export class SpawnDevice{
    private _me;
    private _id: string;
    private _queue: any[];
    constructor(id: string){
        this._id = id;
        this._me = Game.getObjectById(id);
        spawns[id] = this;
    }
    get id(){
        return this.name;
    }
    get name(){
        return this._id;
    }
    get me(){
        return this._me;
    }
    get pos(){
        return this.me.pos;
    }
    get room(){
        return FS.open(`/dev/room/${this.me.room.name}`);
    }
    get energy(){
        return this.me.energy;
    }
    get energyCapacity(){
        return this.me.energyCapacity;
    }
    get energyPercent(){
        return ((this.energy / this.energyCapacity) * 100).toFixed();
    }
    get hits(){
        return this.me.hits;
    }
    get hitsMax(){
        return this.me.hitsMax;
    }
    get hitsPercent(){
        return ((this.hits / this.hitsMax) * 100).toFixed();
    }
    get spawning(){
        return this.me.spawning;
    }
    get queue(){
        if(!this._queue && memory.has(C.SEGMENTS.DEVICES)){
            const dmem = memory.get(C.SEGMENTS.DEVICES);
            if(!dmem.spawnQueue){
                dmem.spawnQueue = {};
            }
            this._queue = dmem.spawnQueue[this.id] || [];
        }
        return this._queue.map((item) => {
            return {
                host: FS.open(`/dev/source/${item.host}`),
                role: item.role
            };
        });
    }
    public add(role: string, host: any){
        this._queue.push({
            host: host.id,
            role
        });
    }
    public save(){
        const dmem = memory.get(C.SEGMENTS.DEVICES);
        if(!dmem.spawnQueue){
            dmem.spawnQueue = {};
        }
        dmem.spawnQueue[this.id] = this._queue;
    }
}

function has(id): boolean{
    return FS.has(`/dev/spawn/${id}`);
}
function register(id): void{
    if(has(id)){
        throw new Error(`Room ${id} already registered`);
    }
    FS.register(`/dev/spawn/${id}`, new SpawnDevice(id));
}

export default {
    has,
    open: (id): any => {
        if(!has(id)){
            register(id);
            if(!has(id)){
                throw new Error(`Room ${id} does not exist`);
            }
        }
        return spawns[id];
    },
    register,
    remove: (id): void => {
        FS.remove(`/dev/spawn/${id}`);
        delete spawns[id];
    },
    save: (id): void => {
        if(!id){
            _.each(spawns, (spawn: SpawnDevice) => spawn.save());
        }
    }
};
