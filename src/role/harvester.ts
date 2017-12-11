import {CreepDevice} from '../dev/creep';
import {default as Role} from '../kernel/role';

export default {
    body: () => [MOVE, CARRY, WORK],
    name: 'harvester',
    run: (creep: CreepDevice): void => {
        if(!creep.isFull){
            let code = creep.me.harvest(creep.host);
            if(code === ERR_NOT_IN_RANGE){
                code = creep.travelTo(creep.hostPos);
            }
            if(code !== OK){
                console.log(`Creep#${creep.id}: ${code}`);
            }
        }else{
            if(creep.target.id === creep.host.id){
                creep.target = _.min(
                    creep.room.spawns,
                    (spawn) => creep.pos.getRangeTo(spawn.me)
                );
            }
            let code = creep.me.transfer(creep.target, RESOURCE_ENERGY);
            if(code === ERR_NOT_IN_RANGE){
                code = creep.travelTo(creep.target);
            }
            if(code !== OK){
                console.log(`Creep#${creep.id}: ${code}`);
            }
        }
    }
} as Role;
