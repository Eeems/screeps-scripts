import {Process} from '../process';

export interface SYSCALL{
    run: (process: Process) => any;
}
export function isSYSCALL(obj: any): obj is SYSCALL{
    return (obj as SYSCALL).run !== undefined;
}

import {Fork} from './fork';
import {Inject} from './inject';
import {Kill} from './kill';
import {Priority} from './priority';
import {Reboot} from './reboot';
import {Sleep} from './sleep';
import {Yield} from './yield';
export {Fork};
export {Inject};
export {Kill};
export {Priority};
export {Reboot};
export {Sleep};
export {Yield};
