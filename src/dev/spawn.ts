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
        role: FS.open(`/role/${item.role}`)
    };
}

export class SpawnDevice{
    private _time: number;
    private _id: string;
    private _queue: any[];
    constructor(id: string){
        this._id = id;
        this.uncache();
        spawns[id] = this;
    }
    private uncache(){
        if(this._time !== Game.time){
            this._time = Game.time;
            delete this._queue;
        }
    }
    get id(): string{
        return this._id;
    }
    get name(): string{
        return this.me.name;
    }
    get me(): StructureSpawn{
        return Game.getObjectById(this.id) as StructureSpawn;
    }
    get pos(): RoomPosition{
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
        this.uncache();
        if(this._queue === undefined && memory.has(C.SEGMENTS.DEVICES)){
            const dmem = memory.get(C.SEGMENTS.DEVICES);
            if(!dmem.spawnQueue){
                dmem.spawnQueue = {};
            }
            this._queue = dmem.spawnQueue[this.id] || [];
        }
        return this._queue.map(transformQueueItem);
    }
    get queued(): boolean{
        return this.queue  && !!this.queue.length;
    }
    public add(role: string, host?: any): void{
        let item: {role: string, host?: string} = { role };
        if(host !== undefined){
            item.host = host.id || host
        }
        this._queue.push(item);
    }
    public spawnNext(){
        if(!this.spawning && this.queued){
            const item = transformQueueItem(this._queue.pop());
            if(this.energy >= this.spawnCost(item.role)){
                return this.spawn(item.role, item.host);
            }
        }
    }
    public spawn(role: Role, host: string): number{
        let name;
        do{
            name = `${role.name}_${uid()}`;
        }while(Game.creeps[name]);
        const code = this.me.spawnCreep(role.body(), name, {
                energyStructures: this.room.energyStructures
            });
        if(code === OK){
            const dmem = memory.get(C.SEGMENTS.DEVICES);
            if(!dmem.creeps){
                dmem.creeps = {};
            }
            dmem.creeps[name] = {
                role: role.name,
                host: host
            };
        }
        return code;
    }
    public spawnCost(role: Role){
        return Math.max(_.reduce(role.body(), (n, part) => n + BODYPART_COST[part], 0), 300);
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
    save: (id?): void => {
        if(!id){
            _.each(spawns, (spawn: SpawnDevice) => spawn.save());
        }
    }
};
