import {CreepDevice} from '../dev/creep';
import {default as Role} from '../kernel/role';

export default {
    body: () => [MOVE, CARRY, WORK],
    name: 'harvester',
    run: (creep: CreepDevice): void => {
        console.log(`I am ${creep.name}`);
    }
} as Role;
