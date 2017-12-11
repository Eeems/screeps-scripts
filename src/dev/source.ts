import { FS } from '../kernel/fs';

export interface SourceSpace {
    id: string;
    x: number;
    y: number;
    pos?: RoomPosition;
}

const sources = {};

export class SourceDevice{
    private _me;
    private _id: string;
    private _spaces: SourceSpace[];
    constructor(id: string){
        this._id = id;
        this._me = Game.getObjectById(id);
        sources[id] = this;
    }
    get me(){
        return this._me;
    }
    get id(){
        return this._id;
    }
    get name(){
        return this.me.name;
    }
    get pos(){
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
                .filter((item) => item.host === this.id)
                .forEach((item) => spawning.push(item));
            return spawning;
        }, []);
    }
    get spaces(): SourceSpace[]{
        if(this._spaces === undefined){
            this._spaces = [];
            _.each(
                this.room.me.lookAtArea(this.pos.y - 1, this.pos.x - 1, this.pos.y + 1, this.pos.x + 1),
                (items, y) => {
                    _.each(items, (subitems, x) => {
                        if(_.reduce(
                            subitems,
                            (passable, item: {type: string, terrain?: string, structure?: Structure}) => {
                                if(passable){
                                    if(item.type === 'terrain'){
                                        passable = item.terrain !== 'wall';
                                    }else if(item.type === 'structure'){
                                        passable = !~OBSTACLE_OBJECT_TYPES.indexOf(item.structure.structureType);
                                    }else{
                                        passable = item.type !== 'creep';
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
    get freeSpaces(){
        const hosts = _.union(
            this.room
                .creeps
                .filter((creep) => creep.host)
                .map((creep) => creep.host.id),
            this.spawning.map((item) => item.host)
        );
        return this.spaces.filter((space) => !~hosts.indexOf(space.id));
    }
    public ensureHarvesters(){
        if(this.freeSpaces.length){
            const spawns = this.room.spawns.filter((spawn) => !spawn.spawning);
            if(spawns.length){
                _.take(this.freeSpaces, spawns.length).forEach((space, i) => {
                    spawns[i].add('harvester', space);
                });
            }
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
    save: (id): void => {id;/*empty*/}
};
