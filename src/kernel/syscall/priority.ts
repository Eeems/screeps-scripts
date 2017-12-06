import {Process} from '../process';
import {SYSCALL} from './index';

export class Priority implements SYSCALL{
    public priority: number;
    constructor(newPriority: number){
        this.priority = newPriority;
    }
    public run(process: Process): void{
        process.priority = this.priority;
    }
}

export default function priority(newPriority: number){
    return new Priority(newPriority);
}
