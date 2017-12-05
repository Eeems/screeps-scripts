import {startProcess} from '../kernel';
import {Process} from '../process';
import {SYSCALL} from './index';

export class Fork implements SYSCALL{
    public priority: number;
    public imageName: string;
    constructor(priority: number, imageName: string){
        this.priority = priority;
        this.imageName = imageName;
    }
    public run(process: Process): number | boolean{
        const child = startProcess(this.imageName, this.priority, process.pid);
        return child ? child.pid : false;
    }
}
