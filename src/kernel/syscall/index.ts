import {Process} from '../process';

export interface SYSCALL{
    run: (process: Process) => any;
}
export function isSYSCALL(obj: any): obj is SYSCALL{
    return (obj as SYSCALL).run !== undefined;
}

import fork from './fork';
import inject from './inject';
import interrupt from './interrupt';
import kill from './kill';
import priority from './priority';
import reboot from './reboot';
import sleep from './sleep';

export {
    fork,
    inject,
    interrupt,
    kill,
    priority,
    reboot,
    sleep
};
