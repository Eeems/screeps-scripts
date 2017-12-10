import C from '../kernel/constants';
import { FS } from '../kernel/fs';
import { default as memory } from '../kernel/memory';
import {default as Role} from '../kernel/role';

const spawns = {};

function uid(){
    return Math.random().toString(36).substring(7);
}

function transformQueueItem(item){
    return {
        host: item.host,
        role: FS.open('/dev/role').open(item.role)
    };
}

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
        return FS.open('/dev/room').open(this.me.room.name);
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
        return this._queue.map(transformQueueItem);
    }
    get queued(){
        return this._queue  && this._queue.length;
    }
    public add(role: string, host: any): void{
        this._queue.push({
            host: host.id,
            role
        });
    }
    public spawnNext(){
        if(!this.spawning && this.queued){
            const item = transformQueueItem(this._queue.pop());
            return this.spawn(item.role, item.host);
        }
    }
    public spawn(role: Role, host: any): string{
        let name;
        do{
            name = `${role}_${uid()}`;
        }while(Game.creeps[name]);
        if(this.me.spawnCreep(role.body, name, {
            energyStructures: this.room.energyStructures
        }) === OK){
            const creep = FS.open('/dev/creep').open(Game.creeps[name].id);
            creep.role = role.name;
            creep.host = host.id;
            return creep.id;
        }
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
