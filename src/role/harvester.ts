import {CreepDevice} from '../dev/creep';
import {SpawnDevice} from '../dev/spawn';
import {default as C} from '../kernel/constants';
import { FS } from '../kernel/fs';
import {default as Role} from '../kernel/role';

function notFull(structures){
    return structures.filter((s) => (s.energy || _.sum(s.store)) < (s.energyCapacity || s.storeCapacity))
        .map((s) => s.pos);
}

function getNextTarget(creep){
    let targets = [];
    if(!creep.room.creepsWithRole('courier').length){
        targets = notFull(creep.room.energyStructures);
    }
    if(!targets.length){
        targets = notFull(creep.room.storageStructures);
    }
    if(targets.length){
        return _.min(
            targets,
            (pos: RoomPosition) => creep.pos.getRangeTo(pos)
        );
    }
}
function storageStructureAt(pos: RoomPosition): Structure{
    if(pos && pos.look){
        return _.first(
            pos.lookFor(LOOK_STRUCTURES)
                .filter((s: Structure) => ~([
                    STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER
                ] as string[]).indexOf(s.structureType))
        ) as Structure;
    }
}
function depositAtTarget(creep: CreepDevice): number{
    if(!creep.target || creep.targetIs(creep.hostPos)){
        creep.target = getNextTarget(creep) || creep.hostPos;
    }
    if(!creep.target){
        return creep.travelTo(creep.hostPos);
    }
    if(!creep.pos.isNearTo(creep.target)){
        return creep.travelTo(creep.target);
    }
    const structure = storageStructureAt(creep.target);
    if(!structure){
        return ERR_INVALID_TARGET;
    }
    const code = creep.me.transfer(structure, RESOURCE_ENERGY);
    switch(code){
        case ERR_NOT_IN_RANGE:
            return creep.travelTo(creep.target);
        case ERR_FULL:
            const target = getNextTarget(creep);
            if(target){
                creep.target = target;
            }
            return target ? depositAtTarget(creep) : creep.travelTo(creep.hostPos);
    }
    return code;
}
function harvestFromHost(creep: CreepDevice): number{
    if(!FS.open('/dev/source').open(creep.host.id).safe){
        const spawn = _.min(creep.room.spawns, (s: SpawnDevice) => creep.pos.getRangeTo(s));
        if(spawn){
            return creep.travelTo(spawn.pos);
        }
        return ERR_NO_PATH;
    }else if(creep.isAt(creep.hostPos)){
        return creep.me.harvest(creep.host);
    }
    return creep.travelTo(creep.hostPos);
}

function depositIfNear(creep: CreepDevice): void{
    const structures = creep.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (s) => ~([
            STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER
        ] as string[]).indexOf(s.structureType) && (s.energy || _.sum(s.store)) < (s.energyCapacity || s.storeCapacity)
    }) as Structure[];
    if(structures.length){
        creep.target = structures[0];
        if(creep.me.transfer(structures[0], RESOURCE_ENERGY) === OK){
            creep.room.visual.text('🔋', structures[0].pos);
        }
    }
}

function logCode(creep: CreepDevice, fn: (creep: CreepDevice) => number){
    const code = fn(creep);
    if(!~([OK, ERR_TIRED, ERR_BUSY] as number[]).indexOf(code)){
        const msg = C.ERROR_MESSAGES[code] || `${code}`;
        console.log(`Creep#${creep.name}: ${msg}`);
        console.log(`  Action: ${fn.name}`);
        console.log(`  Host:   ${creep.host}`);
        console.log(`  Target: ${creep.target}`);
    }
}

export default {
    body: () => [MOVE, MOVE, CARRY, CARRY, WORK],
    name: 'harvester',
    run: (creep: CreepDevice): void => {
        if(creep.host){
            if(creep.isFull){
                logCode(creep, depositAtTarget);
            }else{
                depositIfNear(creep);
                logCode(creep, harvestFromHost);
            }
            const visual = creep.room.visual;
            if(creep.host){
                visual.text('⛏', creep.hostPos);
            }
            if(creep.target && creep.carry.energy && !creep.targetIs(creep.hostPos)){
                visual.text('🔋', creep.target);
            }
        }else{
            creep.me.suicide();
        }
    }
} as Role;
