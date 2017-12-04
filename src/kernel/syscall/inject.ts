import {Process} from '../process';
import {SYSCALL} from './index';

export class Inject implements SYSCALL{
    public pid: number;
    constructor(pid: number){
        this.pid = pid;
    }
    public run(process: Process): void{
        // todo
        process;
    }
}
