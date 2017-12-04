import {Process} from '../process';
import {SYSCALL} from './index';

export class Priority implements SYSCALL{
    public priority: number;
    constructor(priority: number){
        this.priority = priority;
    }
    public run(process: Process): void{
        process.priority = this.priority;
    }
}
