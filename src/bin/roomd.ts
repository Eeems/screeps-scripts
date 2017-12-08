import * as SYSCALL from '../kernel/syscall';

function getSpaces(spawn, smem, mem){
    smem.spaces = [];
    const spawnY = spawn.pos.y,
        spawnX = spawn.pos.x;
    _.each(
        spawn.room.lookAtArea(spawnY - 1, spawnX - 1, spawnY + 1, spawnX + 1, false),
        (items, y) => {
            _.each(items, (subitems, x) => {
                if(
                    _.reduce(
                        subitems,
                        (passable, item: {type: any}) => passable && !~OBSTACLE_OBJECT_TYPES.indexOf(item.type),
                        true
                    )
                ){
                    smem.spaces.push([x, y, null]);
                }
            });
        }
    );
    mem.required = smem.spaces.length;
}

function setup(){
    if(!this.args[0]){
        SYSCALL.kill(1);
    }
}

function next(){
    const room = Game.rooms[this.args[0]];
    if(!room){
        SYSCALL.kill(1);
    }else{
        if(!this.memory){
            this.memory = {
                required: 0
            };
        }
        const mem = this.memory;
        if(!mem.sources){
            mem.sources = room.find(FIND_SOURCES).map((source: {id: string}) => {
                return {id: source.id};
            });
        }
        if(!mem.spawns){
            mem.spawns = room.find(FIND_MY_SPAWNS).map((spawn: {id: string}) => spawn.id);
        }
        if(!mem.creeps){
            mem.creeps = room.find(FIND_MY_CREEPS).map((creep: {id: string}) => creep.id);
        }
        const sources = mem.sources.map((item) => {
                const source = Game.getObjectById(item.id);
                if(!item.spaces){
                    getSpaces(source, item, mem);
                }
                return source;
            }),
            creeps = mem.creeps.map((id) => Game.getObjectById(id));
        if(mem.required){
            // const spawns = mem.spawns.map((id) => Game.getObjectById(id));
        }
        sources;
        creeps;
    }
}

export default {
    next,
    setup
};
