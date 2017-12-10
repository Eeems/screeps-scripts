import {CreepDevice} from '../dev/creep';

export const RoleProps = ['setup', 'run'];

export default interface Role {
    body: () => string[];
    name: string;
    run?: (creep: CreepDevice) => void;
    setup?: (creep: CreepDevice) => void;
}
