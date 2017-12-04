import {Process} from '../process';
import {SYSCALL} from './index';

export class Reboot implements SYSCALL{
    public run(process: Process): void{
        // todo
        process;
    }
}
