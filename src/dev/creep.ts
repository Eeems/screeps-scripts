import C from '../kernel/constants';
import { FS } from '../kernel/fs';
import { default as memory } from '../kernel/memory';

const creeps = {};

// function uid(){
//     return Math.random().toString(36).substring(7);
// }

export class CreepDevice{
    private _me;
    private _id: string;
    private _memory: any;
    private _host: any;
    constructor(id: string){
        this._id = id;
        this._me = Game.getObjectById(id);
        const dmem = memory.get(C.SEGMENTS.DEVICES);
        if(!dmem.creep){
            dmem.creep = {};
        }
        if(!dmem.creep[this.id]){
            dmem.creep[this.id] = {};
        }
        creeps[id] = this;
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
    get saying(){
        return this.me.saying;
    }
    get ticksToLive(){
        return this.me.ticksToLive;
    }
    get body(){
        return this.me.body;
    }
    get fatigue(){
        return this.me.fatigue;
    }
    get spawning(){
        return this.me.spawning;
    }
    get carry(){
        return this.me.carry;
    }
    get carried(){
        return _.sum(this.carry);
    }
    get carryCapacity(){
        return this.me.carryCapacity;
    }
    get carryPercent(){
        return ((this.carried / this.carryCapacity) * 100).toFixed();
    }
    get isFull(){
        return this.carried === this.carryCapacity;
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
    get host(){
        if(!this._host){
            let id = this.memory.host;
            this._host = Game.getObjectById(id) || Game.rooms[id];
            if(!this._host && id.includes('.')){
                id = id.split('.');
                this._host = (Game.getObjectById(id[0]) as {room: Room}).room.getPositionAt(id[1], id[2]);
            }
        }
        return this._host;
    }
    set host(host){
        this.memory.host = host.id;
    }
    get role(){
        return this.memory.role;
    }
    set role(role){
        this.memory.role = role;
    }
    get memory(){
        return this._memory;
    }
    public save(){
        const dmem = memory.get(C.SEGMENTS.DEVICES);
        if(!dmem.creep){
            dmem.creep = {};
        }
        dmem.creep[this.id] = this.memory;
    }
}

function has(id): boolean{
    return FS.has(`/dev/creep/${id}`);
}
function register(id): void{
    if(has(id)){
        throw new Error(`Creep ${id} already registered`);
    }
    FS.register(`/dev/creep/${id}`, new CreepDevice(id));
}

export default {
    has,
    open: (id): any => {
        if(!has(id)){
            register(id);
            if(!has(id)){
                throw new Error(`Creep ${id} does not exist`);
            }
        }
        return creeps[id];
    },
    register,
    remove: (id): void => {
        FS.remove(`/dev/creep/${id}`);
        delete creeps[id];
    },
    save: (id): void => {
        if(!id){
            _.each(creeps, (creep: CreepDevice) => creep.save());
        }
    }
};
