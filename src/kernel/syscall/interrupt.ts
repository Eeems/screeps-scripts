import {Process, Status} from '../process';
import {SYSCALL} from './index';
import {setInterrupt} from '../kernel'
import C from '../constants';

export class Interrupt implements SYSCALL{
    public interrupt: number;
    public interrupt_type: string;
    constructor(interrupt: number, interrupt_type?: string){
        this.interrupt = interrupt;
        this.interrupt_type = interrupt_type || C.INTERRUPT_TYPE.INTERRUPT;
    }
    public run(process: Process): void{
        if(this.interrupt_type === C.INTERRUPT_TYPE.WAKE){
            process.status = Status.INACTIVE;
        }
        setInterrupt(process, this.interrupt, this.interrupt_type);
    }
}
