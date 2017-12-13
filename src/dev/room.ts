import {FS} from '../kernel/fs';
import {CreepDevice} from './creep';
import {SourceDevice, SourceSpace} from './source';
import {SpawnDevice} from './spawn';

const rooms = {},
    costMatrix = {},
    creepCostMatrix = {};
let tick: number = Game.time;

export class RoomDevice{
    private _time: number;
    private _id: string;
    private _energyStructures: string[];
    private _storageStructures: string[];
    private _spawns: string[];
    private _sources: string[];
    private _creeps: string[];
    constructor(id: string){
        this._id = id;
        this.uncache();
        rooms[id] = this;
    }
    get id(){
        return this.name;
    }
    get name(){
        return this._id;
    }
    get me(){
        return Game.rooms[this.name];
    }
    get visual(){
        let visual = this.me.visual;
        if(visual === undefined){
            visual = new RoomVisual(this.name);
        }
        return visual;
    }
    get controller(){
        return this.me.controller;
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
        this.uncache();
        if(this._energyStructures === undefined){
            this._energyStructures = this.me
                .find(FIND_STRUCTURES,{
                    filter:(s: Structure) => s.isActive() &&
                        !!~([STRUCTURE_EXTENSION, STRUCTURE_SPAWN] as string[]).indexOf(s.structureType)
                })
                .map((s: Structure) => s.id);
        }
        return this._energyStructures.map((id) => Game.getObjectById(id));
    }
    get storageStructures(){
        this.uncache();
        if(this._storageStructures === undefined){
            this._storageStructures = this.me
                .find(FIND_STRUCTURES, {
                        filter: (s: Structure) => s.isActive() &&
                            !!~([STRUCTURE_STORAGE, STRUCTURE_CONTAINER] as string[]).indexOf(s.structureType)
                })
                .map((s: Structure) => s.id);
        }
        return this._storageStructures.map((id) => Game.getObjectById(id));
    }
    get containers(): StructureContainer[]{
        return this.storageStructures
            .filter((s: Structure) => s.structureType === STRUCTURE_CONTAINER) as StructureContainer[];
    }
    get sourceSpaces(): SourceSpace[]{
        return _.flatten(
            this.sources.map((source: SourceDevice) => source.spaces)
        ) as SourceSpace[];
    }
    get freeSourceSpaces(): SourceSpace[]{
        return _.flatten(
            this.sources.map((source: SourceDevice) => source.freeSpaces)
        ) as SourceSpace[];
    }
    get occupiedSourceSpaces(){
        return _.flatten(
            this.sources.map((source: SourceDevice) => source.occupiedSpaces)
        ) as SourceSpace[];
    }
    get spawns(){
        this.uncache();
        if(this._spawns === undefined){
            this._spawns = this.me
                .find(FIND_MY_SPAWNS)
                .map((s: StructureSpawn) => s.id);
        }
        return this._spawns.map(FS.open('/dev/spawn').open);
    }
    get sources(){
        this.uncache();
        if(this._sources === undefined){
            this._sources = this.me
                .find(FIND_SOURCES)
                .map((s: Source) => s.id);
        }
        return this._sources.map(FS.open('/dev/source').open);
    }
    get creeps(){
        this.uncache();
        if(this._creeps === undefined){
            this._creeps = this.me
                .find(FIND_MY_CREEPS)
                .map((s: Creep) => s.id);
        }
        return this._creeps.map(FS.open('/dev/creep').open);
    }
    public creepsWithRole(role: string){
        return this.creeps.filter((c: CreepDevice) => c.role.name === role);
    }
    public queuedWithRole(role: string){
        return _.flatten(
            this.spawns
                .map((s: SpawnDevice) => s.queue.filter((item) => item.role.name === 'builder'))
        );
    }
    private uncache(){
        if(this._time !== Game.time){
            this._time = Game.time;
            delete this._energyStructures;
            delete this._storageStructures;
            delete this._spawns;
            delete this._sources;
            delete this._creeps;
        }
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
    costMatrix: (name: string, creep: boolean = false) => {
        if(tick !== Game.time){
            tick = Game.time;
            _.each(_.keys(creepCostMatrix), (n) => delete creepCostMatrix[n]);
            _.each(_.keys(costMatrix), (n) => delete costMatrix[n]);
        }
        const matrix = creep ? creepCostMatrix : costMatrix;
        if(matrix[name]){
            return matrix[name];
        }else{
            const room = Game.rooms[name];
            if(room){
                const costs = new PathFinder.CostMatrix();
                room.find(FIND_STRUCTURES).forEach((s: any) => {
                    switch(s.structureType){
                        case STRUCTURE_ROAD:
                            costs.set(s.pos.x, s.pos.y, 1);
                            break;
                        case STRUCTURE_CONTAINER:
                        case STRUCTURE_RAMPART:
                            costs.set(s.pos.x, s.pos.y, 2);
                            break;
                        default:
                            costs.set(s.pos.x, s.pos.y, 0xff);
                    }
                });
                room.find(creep ? FIND_CREEPS : FIND_HOSTILE_CREEPS)
                    .forEach((c: Creep) => costs.set(c.pos.x, c.pos.y, 0xff));
                room.find(FIND_SOURCES)
                    .forEach((s: Source) => costs.set(s.pos.x, s.pos.y, 0xff));
                matrix[name] = costs;
                return costs;
            }
            matrix[name] = undefined;
        }
    },
    has,
    open,
    register,
    remove: (id): void => {
        FS.remove(`/dev/room/${id}`);
        delete rooms[id];
    },
    save: (id?): void => {id;/*empty*/}
};
