import { FS } from '../kernel/fs';
import {SpawnDevice} from './spawn';

export interface SourceSpace {
    id: string;
    x: number;
    y: number;
    pos?: RoomPosition;
}

const sources = {};

export class SourceDevice{
    private _time: number;
    private _id: string;
    private _spaces: SourceSpace[];
    constructor(id: string){
        this._id = id;
        this.uncache();
        sources[id] = this;
    }
    get me(): Source{
        return Game.getObjectById(this.id) as Source;
    }
    get id(){
        return this._id;
    }
    get pos(): RoomPosition{
        return this.me.pos;
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
    get room(){
        return FS.open('/dev/room').open(this.me.room.name);
    }
    get safe(){
        return !this.pos.findInRange(FIND_HOSTILE_CREEPS, 10).length;
    }
    get spawning(){
        return this.room.spawns.reduce((spawning, spawn) => {
            spawn.queue
                .filter((item) => item.host && item.host.split('.')[0] === this.id)
                .forEach((item) => spawning.push(item));
            return spawning;
        }, []);
    }
    get spaces(): SourceSpace[]{
        this.uncache();
        if(this._spaces === undefined){
            this._spaces = [];
            _.each(
                this.room.me.lookAtArea(this.pos.y - 1, this.pos.x - 1, this.pos.y + 1, this.pos.x + 1),
                (items, y) => {
                    _.each(items, (subitems, x) => {
                        if((this.pos.x !== ~~x || this.pos.y !== ~~y) && _.reduce(
                            subitems,
                            (passable, item: {type: string, terrain?: string, structure?: Structure}) => {
                                if(passable){
                                    if(item.type === 'terrain'){
                                        passable = item.terrain !== 'wall';
                                    }else if(item.type === 'structure'){
                                        passable = !~OBSTACLE_OBJECT_TYPES.indexOf(item.structure.structureType);
                                    }
                                }
                                return passable;
                            },
                            true
                        )){
                            this._spaces.push({
                                id: `${this.id}.${x}.${y}`,
                                x: ~~x,
                                y: ~~y
                            });
                        }
                    });
                }
            );
        }
        return this._spaces.map((space) => _.defaults(space, {
            pos: this.room.me.getPositionAt(space.x, space.y)
        }));
    }
    get freeSpaces(): SourceSpace[]{
        const hosts = _.union(
            this.room
                .creeps
                .filter((creep) => creep.hostPos)
                .map((creep) => creep.memory.host),
            this.spawning.map((item) => item.host)
        );
        return this.spaces.filter((space) => !~hosts.indexOf(space.id));
    }
    get occupiedSpaces(): SourceSpace[]{
        const hosts = _.union(
            this.room
                .creeps
                .filter((creep) => creep.hostPos)
                .map((creep) => creep.memory.host),
            this.spawning.map((item) => item.host)
        );
        return this.spaces.filter((space) => ~hosts.indexOf(space.id));
    }
    public ensureHarvesters(){
        if(this.safe && this.freeSpaces.length){
            this.freeSpaces.forEach((space, i) => {
                const spawn = _.min(this.room.spawns, (s) => this.pos.getRangeTo(s.pos)) as SpawnDevice;
                if(spawn && spawn.add){
                    spawn.add('harvester', space);
                }
            });
        }
    }
    private uncache(){
        if(this._time !== Game.time){
            this._time = Game.time;
            delete this._spaces;
        }
    }
}

function has(id): boolean{
    return FS.has(`/dev/source/${id}`);
}
function register(id): void{
    if(has(id)){
        throw new Error(`Source ${id} already registered`);
    }
    FS.register(`/dev/source/${id}`, new SourceDevice(id));
}

export default {
    has,
    open: (id): any => {
        if(!has(id)){
            register(id);
            if(!has(id)){
                throw new Error(`Source ${id} does not exist`);
            }
        }
        return sources[id];
    },
    register,
    remove: (id): void => {
        FS.remove(`/dev/source/${id}`);
        delete sources[id];
    },
    save: (id?): void => {id;/*empty*/}
};
