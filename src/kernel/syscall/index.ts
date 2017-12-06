import {Process} from '../process';

export interface SYSCALL{
    run: (process: Process) => any;
}
export function isSYSCALL(obj: any): obj is SYSCALL{
    return (obj as SYSCALL).run !== undefined;
}

import fork from './fork';
import {Inject} from './inject';
import {Kill} from './kill';
import {Priority} from './priority';
import {Reboot} from './reboot';
import {Sleep} from './sleep';
import {Interrupt} from './interrupt';
export {fork};
export function inject(...args): Inject{
    return new Inject(...args);
}
export function kill(...args): Kill{
    return new Kill(...args);
}
export function priority(...args): Priority{
    return new Priority(...args);
}
export function reboot(...args): Reboot{
    return new Reboot(...args);
}
export function sleep(...args): Sleep{
    return new Sleep(...args);
}
export function interrupt(...args): Interrupt{
    return new Interrupt(...args);
}
