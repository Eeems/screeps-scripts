import {SourceSpace} from '../dev/source';
import {SpawnDevice} from '../dev/spawn';
import {default as C} from '../kernel/constants';
import {FS} from '../kernel/fs';
import * as SYSCALL from '../kernel/syscall';

function setup(){
    if(!this.args[0]){
        SYSCALL.kill(1);
    }
}

function run(){
    const room = FS.open('/dev/room').open(this.args[0]);
    if(room){
        room.sources.forEach((source) => source.ensureHarvesters());
        room.spawns.forEach((spawn) => spawn.spawnNext());
        const spawns = room.spawns.filter((spawn) => !spawn.spawning);
        if(spawns.length){
            if(
                !room.creepsWithRole('builder').length &&
                !room.spawns.filter((s) => s.queue.filter((item) => item.role.name === 'builder').length).length
            ){
                spawns.pop().add('builder', room);
            }
            if(
                spawns.length &&
                !room.creepsWithRole('upgrader').length
            ){
                spawns[0].add('upgrader', room);
            }
        }
        const containers = room.containers,
            limit = C.BUILDING_LIMITS.CONTAINERS - containers.length;
        if(limit){
            let spaces = room.sourceSpaces || [];
            console.log(`${this.args[0]} spaces: ${spaces.length}`);
            if(spaces.length > limit){
                spaces = _.take(
                    _.sortBy(
                        spaces,
                        (space: SourceSpace) => _.min(
                            room.spawns,
                            (spawn: SpawnDevice) => space.pos.getRangeTo(spawn.pos)
                        )
                    ),
                    limit
                );
            }
            spaces.forEach((space: SourceSpace) => space.pos.createConstructionSite(STRUCTURE_CONTAINER));
        }
    }else{
        SYSCALL.kill(1);
    }
}

export default {
    run,
    setup
};
