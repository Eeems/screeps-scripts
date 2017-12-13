import {CreepDevice} from '../dev/creep';
import {default as C} from '../kernel/constants';
import {default as Role} from '../kernel/role';

function refuelFromTarget(creep: CreepDevice): number{
    if(!creep.target || creep.targetIs(creep.hostPos) || creep.targetIs(creep.room.controller.pos)){
        const targets = creep.room.storageStructures.filter((s: {store: any}) => _.sum(s.store));
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
        return structure ? creep.me.withdraw(structure, RESOURCE_ENERGY) : ERR_NO_PATH;
    }
    return creep.travelTo(creep.target);
}

function logCode(creep: CreepDevice, fn: (creep: CreepDevice) => number){
    logIfErr(creep, fn.name, fn(creep))
}
function logIfErr(creep, name, code){
    if(!~([OK, ERR_TIRED, ERR_BUSY] as number[]).indexOf(code)){
        const msg = C.ERROR_MESSAGES[code] || `${code}`;
        console.log(`Creep#${creep.name}: ${msg}`);
        console.log(`  Action: ${name}`);
        console.log(`  Host:   ${creep.host}`);
        console.log(`  Target: ${creep.target}`);
    }
}

export default {
    body: () => [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
    name: 'courier',
    run: (creep: CreepDevice): void => {
        if(creep.host){
            if(!creep.carry.energy){
                logCode(creep, refuelFromTarget);
            }else if(!creep.pos.isNearTo(creep.host)){
                logIfErr(creep, 'travelTo', creep.travelTo(creep.hostPos));
            }else if(creep.host.energy < creep.host.energyCapacity){
                logIfErr(creep, 'transfer', creep.me.transfer(creep.host, RESOURCE_ENERGY));
            }
        }
        const visual = creep.room.visual;
        if(creep.host && creep.carry.energy && creep.pos.isNearTo(creep.hostPos)){
            visual.text('🔋', creep.hostPos);
        }
        if(creep.target && !creep.isFull && !creep.targetIs(creep.hostPos)){
            visual.text('🔌', creep.target);
        }
    }
} as Role;
