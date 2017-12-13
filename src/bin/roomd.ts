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
        const spawns = room.spawns.filter((spawn) => !spawn.spawning);
        if(spawns.length){
            if(
                !room.creepsWithRole('builder').length &&
                !room.queuedWithRole('builder').length
            ){
                spawns.pop().add('builder', room);
            }
            if(
                spawns.length &&
                !room.creepsWithRole('upgrader').length &&
                !room.queuedWithRole('upgrader').length
            ){
                spawns[0].add('upgrader', room);
            }
        }
        room.spawns.forEach((spawn) => spawn.spawnNext());
        const containers = room.containers,
            limit = C.BUILDING_LIMITS.CONTAINERS - containers.length;
        if(limit){
            let spaces = room.sourceSpaces || [];
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
        }else{
            // todo handle plotting roads
        }
    }else{
        SYSCALL.kill(1);
    }
}

export default {
    run,
    setup
};
