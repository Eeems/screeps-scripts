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
    let containersToBuild = room.me.find(FIND_CONSTRUCTION_SITES, {
        filter: (s: ConstructionSite) => s.structureType === STRUCTURE_CONTAINER
    });
    const containers = room.containers as StructureContainer[],
        spawns = room.spawns as SpawnDevice[],
        limit = C.BUILDING_LIMITS.CONTAINERS - _.union(
            containers,
            containersToBuild
        ).length;
    if(limit){
        const sources = _.take(
            room.sources.filter(
                (source: SourceDevice) => {
                    return !source.spaces.filter((space: SourceSpace) => {
                        const pos = space.pos;
                        return (
                            pos.lookFor(LOOK_STRUCTURES).filter((s: Structure) => s.structureType === STRUCTURE_CONTAINER).length +
                            pos.lookFor(LOOK_CONSTRUCTION_SITES).filter((s: ConstructionSite) => s.structureType === STRUCTURE_CONTAINER).length
                        );
                    }).length;
                }
            ),
            limit
        );
        sources.forEach((source: SourceDevice) => {
            const space = _.min(
                source.spaces,
                (space: SourceSpace) => _.min(
                    spawns.map(
                        (spawn: SpawnDevice) => spawn.pos.getRangeTo(source.pos)
                    )
                )
            );
            space.pos.createConstructionSite(STRUCTURE_CONTAINER);
        });
        containersToBuild = room.me.find(FIND_CONSTRUCTION_SITES, {
            filter: (s: ConstructionSite) => s.structureType === STRUCTURE_CONTAINER
        });
    }
    if(!containersToBuild.length){
        _.union(room.sources, [room.controller]).forEach((item: SourceDevice | StructureController) => {
            const res = PathFinder.search(item.pos, {
                pos: _.min(
                    item instanceof StructureController
                        ? item.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER
                        })
                        : spawns.map((spawn: SpawnDevice) => spawn.pos),
                    (pos: RoomPosition) => item.pos.getRangeTo(pos)
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
                console.log(`WARNING: unable to route road for ${item}`);
            }
        })
    }
}

function run(){
    const room = FS.open('/dev/room').open(this.args[0]) as RoomDevice;
    if(room){
        const sources = room.sources,
            spawns = room.spawns as SpawnDevice[],
            hasContainers = !!room.containers.length,
            availableSpawns = spawns.filter((spawn: SpawnDevice) => !spawn.spawning) as SpawnDevice[];
        sources.forEach((source: SourceDevice) => source.ensureHarvesters());
        if(availableSpawns.length){
            if(
                room.creepsWithRole('builder').length + room.queuedWithRole('builder').length < (hasContainers ? sources.length : 1)
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
