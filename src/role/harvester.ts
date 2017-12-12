import {CreepDevice} from '../dev/creep';
import {default as C} from '../kernel/constants';
import {default as Role} from '../kernel/role';

function notFull(structures){
    return structures.filter((s) => (s.energy || _.sum(s.store)) < (s.energyCapacity || s.storeCapacity))
        .map((s) => s.pos);
}

function getNextTarget(creep){
    let targets = notFull(creep.room.energyStructures);
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
function spawnAt(pos: RoomPosition){
    if(pos && pos.look){
        return _.first(
            pos.look()
                .filter((item) => item.type === 'structure' && item.structure.structureType === STRUCTURE_SPAWN)
                .map((item) => item.structure)
        );
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
    const spawn = spawnAt(creep.target);
    if(!spawn){
        return ERR_INVALID_TARGET;
    }
    const code = creep.me.transfer(spawn, RESOURCE_ENERGY);
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
    if(creep.isAt(creep.hostPos)){
        const code = creep.me.harvest(creep.host);
        if(code === ERR_NOT_IN_RANGE){
            return creep.travelTo(creep.hostPos);
        }
        return code;
    }else{
        return creep.travelTo(creep.hostPos);
    }
}

function logCode(creep: CreepDevice, code: number, action?: string){
    if(!~([OK, ERR_TIRED, ERR_BUSY] as number[]).indexOf(code)){
        const msg = C.ERROR_MESSAGES[code] || `${code}`;
        console.log(`Creep#${creep.name}: ${msg}`);
        if(action){
            console.log(`  Action: ${action}`);
        }
        console.log(`  Host:   ${creep.host}`);
        console.log(`  Target: ${creep.target}`);
    }
}

export default {
    body: () => [MOVE, CARRY, WORK],
    name: 'harvester',
    run: (creep: CreepDevice): void => {
        if(!creep.isFull){
            logCode(creep, harvestFromHost(creep), 'harvest');
        }else{
            logCode(creep, depositAtTarget(creep), 'deposit');
        }
    }
} as Role;
