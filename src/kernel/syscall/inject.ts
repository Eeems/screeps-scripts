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
export default function inject(pid: number): Inject{
    return new Inject(pid);
}
