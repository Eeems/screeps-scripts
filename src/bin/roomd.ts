import {CreepDevice} from '../dev/creep';
import {SourceSpace, SourceDevice} from '../dev/source';
import {SpawnDevice} from '../dev/spawn';
import {default as roomDevice, RoomDevice} from '../dev/room';
import {default as C} from '../kernel/constants';
import {FS} from '../kernel/fs';
import * as SYSCALL from '../kernel/syscall';

function setup(){
    if(!this.args[0]){
        SYSCALL.kill(1);
    }
}

function ensureBase(room: RoomDevice): void{
    const containers = room.containers as StructureContainer[],
        spawns = room.spawns as SpawnDevice[],
        limit = C.BUILDING_LIMITS.CONTAINERS - containers.length;
    let buildRoads = false;
    if(limit){
        let spaces = room.sourceSpaces || [];
        if(spaces.length > limit){
            spaces = _.take(
                _.sortBy(
                    spaces,
                    (space: SourceSpace) => _.min(
                        spawns,
                        (spawn: SpawnDevice) => space.pos.getRangeTo(spawn.pos)
                    )
                ),
                limit
            );
        }else{
            buildRoads = true;
        }
        spaces.filter(
            (space: SourceSpace) => {
                return !space.pos.lookFor(LOOK_STRUCTURES)
                    .filter((s: Structure) => s.structureType !== STRUCTURE_CONTAINER)
                    .length
            }
        ).forEach((space: SourceSpace) => space.pos.createConstructionSite(STRUCTURE_CONTAINER));
    }
    if(buildRoads){
        room.sources.forEach((source: SourceDevice) => {
            const res = PathFinder.search(source.pos, {
                pos: _.min(
                    spawns.map((spawn: SpawnDevice) => spawn.pos),
                    (pos: RoomPosition) => source.pos.getRangeTo(pos)
                ),
                range: 1
            }, {
                roomCallback: (name) => roomDevice.costMatrix(name)
            });
            if(!res.incomplete){
                res.path
                    .filter(
                        (pos: RoomPosition) => {
                            return !pos.lookFor(LOOK_STRUCTURES)
                                .filter((s: Structure) => s.structureType !== STRUCTURE_ROAD)
                                .length
                        }
                    )
                    .forEach((pos: RoomPosition) => pos.createConstructionSite(STRUCTURE_ROAD));
            }else{
                console.log(`WARNING: ${source} unable to route to nearest spawn`);
            }
        })
    }
}

function run(){
    const room = FS.open('/dev/room').open(this.args[0]) as RoomDevice;
    if(room){
        room.sources.forEach((source: SourceDevice) => source.ensureHarvesters());
        const spawns = room.spawns as SpawnDevice[],
            hasContainers = !!room.containers.length,
            availableSpawns = spawns.filter((spawn: SpawnDevice) => !spawn.spawning) as SpawnDevice[];
        if(availableSpawns.length){
            if(
                !room.creepsWithRole('builder').length &&
                room.queuedWithRole('builder').length < (hasContainers ? 2 : 1)
            ){
                availableSpawns.pop().add('builder', room);
            }
            if(
                availableSpawns.length &&
                !room.creepsWithRole('upgrader').length &&
                !room.queuedWithRole('upgrader').length
            ){
                availableSpawns[0].add('upgrader', room);
            }
        }
        if(hasContainers){
            const hosts = _.union(
                room.creepsWithRole('courier')
                    .filter((creep: CreepDevice) => creep.host)
                    .map((creep: CreepDevice) => creep.host.id),
                room.queuedWithRole('courier')
                    .filter((item: {host: string}) => item.host)
                    .map((item: {host: string}) => item.host.split('.')[0])
            );
            spawns.filter((spawn: SpawnDevice) => !~hosts.indexOf(spawn.id))
                .forEach((spawn: SpawnDevice) => spawn.add('courier', spawn));
        }
        ensureBase(room);
        spawns.forEach((spawn) => spawn.spawnNext());
    }else{
        SYSCALL.kill(1);
    }
}

export default {
    run,
    setup
};
