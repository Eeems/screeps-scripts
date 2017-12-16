import {CreepDevice} from '../dev/creep';
import {default as C} from '../kernel/constants';
import {default as Role} from '../kernel/role';

const VALID_TARGET = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_CONTAINER] as string[],
    VALID_TARGET_WITH_COURIER = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER] as string[];

function refuelFromTarget(creep: CreepDevice): number{
    const courier = creep.room.creepsWithRole('courier').length;
    if(
        !creep.target ||
        creep.targetIs(creep.hostPos) ||
        creep.targetIs(creep.room.controller.pos) ||
        !creep.target
            .lookFor(LOOK_STRUCTURES)
            .filter((s: Structure) => ~(courier ? VALID_TARGET_WITH_COURIER : VALID_TARGET).indexOf(s.structureType))
            .length
    ){
        let targets = creep.room.storageStructures.filter((s: {store: any}) => s.store.energy);
        if(!targets.length && !courier){
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
        return creep.travelTo(creep.hostPos);
    }else if(creep.pos.isNearTo(creep.target)){
        const structure = _.first(
            creep.target
                .lookFor(LOOK_STRUCTURES)
                .filter((s: Structure) => ~VALID_TARGET.indexOf(s.structureType))
        ) as Structure;
        if(structure){
            const code = creep.me.withdraw(structure, RESOURCE_ENERGY);
            if(code === ERR_NOT_ENOUGH_RESOURCES){
                delete creep.memory.target;
            }
            return code;
        }
        return ERR_NO_PATH;
    }
    return creep.travelTo(creep.target);
}

function buildHost(creep: CreepDevice): number{
    if(!creep.host || !(creep.host instanceof ConstructionSite)){
        const sites = creep.room.me.find(FIND_MY_CONSTRUCTION_SITES);
        if(!sites.length){
            const controller = creep.room.controller,
                pos = controller.pos;
            if(!creep.pos.inRangeTo(pos, 3)){
                return creep.travelTo(pos);
            }
            return creep.me.upgradeController(controller);
        }
        creep.host = _.min(
            sites,
            (c: ConstructionSite) => creep.pos.getRangeTo(c)
        );
        return OK;
    }
    if(creep.pos.inRangeTo(creep.hostPos, 3)){
        return creep.me.build(creep.host);
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
    name: 'builder',
    run: (creep: CreepDevice): void => {
        if(creep.carry.energy){
            logCode(creep, buildHost);
        }else{
            logCode(creep, refuelFromTarget);
        }
        const visual = creep.room.visual;
        if(creep.host && creep.carry.energy){
            if(creep.host instanceof ConstructionSite){
                visual.text('🔨', creep.hostPos);
            }else if(creep.host instanceof StructureController){
                visual.text('🔧', creep.hostPos);
            }
        }
        if(creep.target && !creep.isFull && !creep.targetIs(creep.hostPos)){
            visual.text('🔌', creep.target);
        }
    }
} as Role;
