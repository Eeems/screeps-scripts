import { FS } from '../kernel/fs';

const sources = {};

export class SourceDevice{
    private _me;
    private _id: string;
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
        return FS.open(`/dev/room/${this.me.room.name}`);
    }
    get safe(){
        return !this.pos.findInRange(FIND_HOSTILE_CREEPS, 10).length;
    }
    // get spawning(){
    //     return this.spawns.reduce((spawning, spawn) => {
    //         // todo get from spawns
    //         return spawning;
    //     }, []);
    // }
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
