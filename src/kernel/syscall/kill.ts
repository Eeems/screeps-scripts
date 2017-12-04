import {killProcess} from '../kernel';
import {Process} from '../process';
import {SYSCALL} from './index';

export class Kill implements SYSCALL{
    public status: number;
    constructor(status: number){
        this.status = status;
    }
    public run(process: Process): void{
        killProcess(process.pid);
        process.return(0);
    }
}
