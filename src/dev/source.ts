import { FS } from '../kernel/fs';

const sources = {};

export class SourceDevice{
    private _me;
    private _id: string;
    private _spaces;
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
            if(spawn.queue.filter((item) => item.host.id === this.id).length){
                spawning.push(spawn);
            }
            return spawning;
        }, []);
    }
    get spaces(){
        if(!this._spaces){
            this._spaces = [];
            _.each(this.room.me.lookAtArea(this.pos.y - 1, this.pos.x - 1, this.pos.y + 1, this.pos.x + 1), (items, y) => {
                _.each(items, (subitems, x) => {
                    if(_.reduce(subitems, (passable, item: {type: string}) => passable && !~OBSTACLE_OBJECT_TYPES.indexOf(item.type), true)){
                        this._spaces.push({
                            id: `${this.id}.${x}.${y}`,
                            x, y
                        });
                    }
                });
            });
        }
        return this._spaces.forEach((space) => this.room.me.getPositionAt(space.x, space.y));
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
