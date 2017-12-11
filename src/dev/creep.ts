import {default as C} from '../kernel/constants';
import { FS } from '../kernel/fs';
import { default as memory } from '../kernel/memory';
import {default as Role} from '../kernel/role';

const creeps = {};

export class CreepDevice{
    private _me;
    private _id: string;
    private _memory: any;
    private _host: any;
    private _target: any;
    private _hostPos: any;
    constructor(id: string){
        this._id = id;
        this._me = Game.getObjectById(id);
        const dmem = memory.get(C.SEGMENTS.DEVICES);
        if(!dmem.creeps){
            dmem.creeps = {};
        }
        if(!dmem.creeps[this.name]){
            dmem.creeps[this.name] = {};
        }
        this._memory = dmem.creeps[this.name];
        creeps[id] = this;
    }
    get id(){
        return this._id;
    }
    get name(){
        return this.me.name;
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
    get target(){
        if(!this._target){
            if(!this.memory.target){
                this.memory.target = this.host.id;
            }
            this._target = Game.getObjectById(this.memory.target) || Game.rooms[this.memory.target];
        }
        return this._target;
    }
    set target(obj){
        this.memory.target = obj.id || obj.name;
        delete this._target;
    }
    get host(){
        if(!this._host){
            let id = this.memory.host;
            if(id){
                this._host = Game.getObjectById(id) || Game.rooms[id];
                if(!this._host && id.includes('.')){
                    this._host = Game.getObjectById(id.split('.')[0]);
                }
            }
        }
        return this._host;
    }
    set host(host){
        this.memory.host = host.id;
        delete this._host;
    }
    get hostPos(){
        if(!this._hostPos){
            let id = this.memory.host;
            if(id.includes('.')){
                id = id.split('.');
                this._hostPos = this.host.room.getPositionAt(id[1], id[2]);
            }else{
                this._hostPos = this.host.pos;
            }
        }
        return this._hostPos;
    }
    get path(){
        return this.memory.path;
    }
    set path(newPath){
        this.memory.path = newPath;
    }
    get role(){
        if(!this.memory.role){
            this.memory.role = this.name.split('_')[0];
        }
        return FS.open(`/role/${this.memory.role}`);
    }
    set role(role: Role){
        this.memory.role = role.name;
    }
    get memory(){
        return this._memory;
    }
    public save(){
        const dmem = memory.get(C.SEGMENTS.DEVICES);
        if(!dmem.creeps){
            dmem.creeps = {};
        }
        dmem.creeps[this.name] = this.memory;
    }
    public run(){
        if(!this.spawning){
            const role = this.role;
            if(role.run){
                role.run(this);
            }
        }
    }
    public setup(){
        if(!this.spawning){
            const role = this.role;
            if(role.setup){
                role.setup(this);
            }
        }
    }
    public interrupt(interrupt: number, interrupt_type: number, signal?: any){
        if(!this.spawning){
            const role = this.role;
            if(role.interrupt){
                role.interrupt(this, interrupt, interrupt_type, signal);
            }
        }
    }
    public wake(interrupt: number, interrupt_type: number){
        if(!this.spawning){
            const role = this.role;
            if(role.wake){
                role.wake(this, interrupt, interrupt_type);
            }
        }
    }
    public kill(e?: any){
        if(!this.spawning){
            const role = this.role;
            if(role.kill){
                role.kill(this, e);
            }
        }
    }
    public getPathTo(target){
        const res = PathFinder.search(this.pos, target.pos || target, {
            roomCallback: (name) => {
                const room = Game.rooms[name];
                if(room){
                    let costs = new PathFinder.CostMatrix;
                    room.find(FIND_STRUCTURES).forEach((s: any) => {
                        if(s.structureType === STRUCTURE_ROAD){
                            costs.set(s.pos.x, s.pos.y, 1);
                        }else if(!~[STRUCTURE_CONTAINER, STRUCTURE_RAMPART].indexOf(s.structureType) || !s.my){
                            costs.set(s.pos.x, s.pos.y, 0xff);
                        }
                    });
                    room.find(FIND_HOSTILE_CREEPS).forEach((c: Creep) => costs.set(c.pos.x, c.pos.y, 0xff));
                    return costs;
                }
            }
        });
        if(res.incomplete){
            console.log(`WARNING: Incomplete path to ${target}`);
            console.log(JSON.stringify(res.path));
        }
        return res.path;
    }
    public travelTo(target): number{
        if(this.target !== target){
            this.target = target;
            this.path = this.getPathTo(target);
        }
        const path = this.path;
        if(path.length){
            const pos = path.shift(),
                code = this.me.move(this.pos.getDirectionTo(pos));
            this.path = path;
            return code;
        }
        return OK;
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
