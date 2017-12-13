import {CreepDevice} from '../dev/creep';
import {default as C} from '../kernel/constants';
import {default as Role} from '../kernel/role';

function getEnergy(creep: CreepDevice): number{
    if(!creep.target || creep.targetIs(creep.hostPos)){
        let targets = creep.room.me.find(FIND_DROPPED_RESOURCES, {
            filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY
        });
        if(!targets.length){
            targets = creep.room.storageStructures.filter((s: {store: any}) => _.sum(s.store));
        }
        if(!targets.length && creep.room.controller.ticksToDowngrade < 100){
            targets = creep.room.energyStructures.filter((s: {energy: number}) => s.energy);
        }
        if(targets.length){
            creep.target = _.min(
                targets,
                (pos: RoomPosition) => creep.pos.getRangeTo(pos)
            );
        }
    }
    if(!creep.target){
        return ERR_NO_PATH;
    }else if(creep.pos.isNearTo(creep.target)){
        const structure = _.first(
            creep.target
                .lookFor(LOOK_STRUCTURES)
                .filter((s: Structure) => ~([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_CONTAINER] as string[]).indexOf(s.structureType))
        ) as Structure;
        if(structure){
            return creep.me.withdraw(structure, RESOURCE_ENERGY)
        }
        const energy = _.first(
            creep.target
                .lookFor(LOOK_RESOURCES)
                .filter((r: Resource) => r.resourceType === RESOURCE_ENERGY)
        ) as Resource;
        if(energy){
            return creep.me.pickup(energy);
        }
        return ERR_NO_PATH;
    }
    return creep.travelTo(creep.target);
}

function upgradehost(creep: CreepDevice): number{
    if(!creep.host || !(creep.host instanceof StructureController)){
        creep.host = creep.room.controller;
    }
    if(creep.pos.inRangeTo(creep.hostPos, 3)){
        if(!creep.targetIs(creep.hostPos)){
            creep.target = creep.hostPos;
        }
        return creep.me.upgradeController(creep.host);
    }
    return creep.travelTo(creep.hostPos);
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
    name: 'upgrader',
    run: (creep: CreepDevice): void => {
        if(creep.carry.energy){
            logCode(creep, upgradehost);
        }else{
            logCode(creep, getEnergy);
        }
        const visual = creep.room.visual;
        if(creep.host && creep.carry.energy){
            visual.text('🔧', creep.hostPos);
        }
        if(creep.target && !creep.targetIs(creep.hostPos) && creep.pos.isNearTo(creep.target)){
            visual.text('🔌', creep.target);
        }
    }
} as Role;
