import { FS } from '../kernel/fs';

const rooms = {};

export class RoomDevice{
    private _me;
    private _id: string;
    private _energyStructures: any[];
    private _storageStructures: any[];
    private _spawns: any[];
    constructor(id: string){
        this._id = id;
        this._me = Game.rooms[id];
        rooms[id] = this;
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
    get visual(){
        let visual = this.me.visual;
        if(visual === undefined){
            visual = new RoomVisual(this.name);
        }
        return visual;
    }
    get controller(){
        return FS.open('/dev/controller').open(this.me.controller.id);
    }
    get storage(){
        return this.me.storage;
    }
    get terminal(){
        if(this.me.terminal){
            return FS.open('/dev/terminal').open(this.me.terminal.id);
        }
    }
    get energyAvailable(){
        return this.me.energyAvailable;
    }
    get energyCapacityAvailable(){
        return this.me.energyCapacityAvailable;
    }
    get energyPercent(){
        return ((this.energyAvailable / this.energyCapacityAvailable) * 100).toFixed();
    }
    get energyStructures(){
        if(this._energyStructures === undefined){
            this._energyStructures = this.me
                .find(FIND_STRUCTURES, (s) => s.isActive() &&
                    !!~[STRUCTURE_EXTENSION, STRUCTURE_SPAWN].indexOf(s.structureType))
                .map((s) => s.id);
        }
        return this._energyStructures.map((id) => Game.getObjectById(id));
    }
    get storageStructures(){
        if(this._storageStructures === undefined){
            this._storageStructures = this.me
                .find(FIND_STRUCTURES, (s) => s.isActive() &&
                    !!~[STRUCTURE_STORAGE, STRUCTURE_CONTAINER].indexOf(s.structureType))
                .map((s) => s.id);
        }
        return this._storageStructures.map((id) => Game.getObjectById(id));
    }
    get spawns(){
        if(this._spawns === undefined){
            this._spawns = this.me
                .find(FIND_MY_SPAWNS)
                .map((s) => s.id);
        }
        const device = FS.open('/dev/spawn');
        return this._spawns.map((id) => device.open(id));
    }
}

function has(id): boolean{
    return FS.has(`/dev/room/${id}`);
}

function open(id): any{
    if(!has(id)){
        register(id);
        if(!has(id)){
            throw new Error(`Room ${id} does not exist`);
        }
    }
    return rooms[id];
}
function register(id): void{
    if(has(id)){
        throw new Error(`Room ${id} already registered`);
    }
    FS.register(`/dev/room/${id}`, new RoomDevice(id));
}

export default {
    has,
    open,
    register,
    remove: (id): void => {
        FS.remove(`/dev/room/${id}`);
        delete rooms[id];
    },
    save: (id): void => {id;/*empty*/}
};
