import {CreepDevice} from '../dev/creep';

export const RoleProps = ['setup', 'run'];

export default interface Role{
    body: () => string[];
    name: string;
    run?: (creep: CreepDevice) => void;
    setup?: (creep: CreepDevice) => void;
    interrupt?: (creep: CreepDevice, interrupt: number, interrupt_type: number, signal?: any) => any;
    wake?: (creep: CreepDevice, interrupt: number, interrupt_type: number) => any;
    kill?: (creep: CreepDevice, e?: any) => any;
}
