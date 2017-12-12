import {default as C} from '../kernel/constants';
import { FS } from '../kernel/fs';
import { default as memory } from '../kernel/memory';
import {default as Role} from '../kernel/role';
import {default as RoomDevice} from '../dev/room';

const creeps = {};

function equalPos(pos0: RoomPosition, pos1: RoomPosition): boolean{
    return pos0 && pos1 && pos0.roomName === pos1.roomName && pos0.x === pos1.x && pos0.y === pos1.y;
}

export class CreepDevice{
    private _time: number;
    private _id: string;
    private _name: string;
    private _memory: any;
    private _host: any;
    private _target: any;
    private _hostPos: any;
    constructor(id: string){
        this._id = id;
        this.uncache();
        creeps[id] = this;
    }
    private uncache(){
        if(this._time !== Game.time){
            this._time = Game.time;
            if(!this._name){
                this._name = this.name;
            }
            const dmem = memory.get(C.SEGMENTS.DEVICES);
            if(!dmem.creeps){
                dmem.creeps = {};
            }
            if(!dmem.creeps[this.name]){
                dmem.creeps[this.name] = {};
            }
            this._memory = dmem.creeps[this.name];
            delete this._host;
            delete this._target;
            delete this._hostPos;
        }
    }
    get id(): string{
        return this._id;
    }
    get name(): string{
        const me = this.me;
        return me ? me.name : this._name;
    }
    get me(): Creep{
        return Game.getObjectById(this.id) as Creep;
    }
    get pos(): RoomPosition{
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
        this.uncache();
        if(!this._target){
            if(!this.memory.target || typeof this.memory.target !== 'object'){
                this.memory.target = this.host.pos;
            }
            const target = this.memory.target;
            this._target = new RoomPosition(~~target.x, ~~target.y, target.roomName);
        }
        return this._target;
    }
    set target(obj){
        if(obj !== this._target){
            if(obj instanceof RoomPosition){
                this.memory.target = obj;
                this._target = obj;
            }else if(obj && obj.pos){
                this.memory.target = obj.pos;
                this._target = obj.pos;
            }else{
                delete this.memory.target;
                delete this._target;
            }
        }
    }
    get host(){
        this.uncache();
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
        this.uncache();
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
    public getPathTo(pos: RoomPosition, range: number = 0, creep: boolean = false){
        const res = PathFinder.search(this.pos, {
            pos,
            range
        }, {
            roomCallback: (name) => RoomDevice.costMatrix(name, creep)
        });
        if(res.incomplete){
            return [];
        }
        return res.path;
    }
    get nextPos(): RoomPosition{
        if(this.path && this.path.length){
            const pos = this.memory.path.shift();
            return new RoomPosition(~~pos.x, ~~pos.y, pos.roomName);
        }
    }
    public travelTo(target: RoomPosition): number{
        if(!equalPos(this.target, target)){
            this.target = target;
            this.path = this.getPathTo(target);
            delete this.memory.lastPos;
        }
        let pos = this.nextPos,
            lastPos = this.memory.lastPos;
        if(pos && lastPos && equalPos(lastPos, pos)){
            this.path = this.getPathTo(target, 0, true);
            pos = this.nextPos;
            if(!pos){
                this.path = this.getPathTo(target, 1, true);
                pos = this.nextPos;
            }
        }else if(!pos || !pos.isNearTo(this.pos)){
            this.path = this.getPathTo(target);
            pos = this.nextPos;
            if(!pos){
                this.path = this.getPathTo(target, 1);
                pos = this.nextPos;
            }
        }
        if(!pos || equalPos(lastPos, pos)){
            return ERR_NO_PATH;
        }
        const room = this.room,
            visual = room.visual,
            style = {
                width: 0.1,
                color: '#ffffff',
                opacity: 0.5,
                lineStyle: 'dashed'
            };
        if(pos.roomName === room.name){
            visual.line(this.pos, pos, style);
            if(this.path.length){
                lastPos = pos;
                this.path
                    .filter((pos) => pos.roomName === room.name)
                    .forEach((pos) => {
                        visual.line(lastPos, pos, style);
                        lastPos = pos;
                    });
            }
        }
        this.memory.lastPos = pos;
        return this.me.move(this.pos.getDirectionTo(pos));
    }
    public isAt(pos: RoomPosition): boolean{
        return equalPos(this.pos, pos);
    }
    public targetIs(pos: RoomPosition): boolean{
        return equalPos(this.target, pos);
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
        delete memory.get(C.SEGMENTS.DEVICES).creeps[id];
    },
    save: (id?): void => {
        if(!id){
            _.each(creeps, (creep: CreepDevice) => creep.save());
        }else if(has(id)){
            creeps[id].save();
        }
    }
};
