import C from '../constants';
import {setInterrupt} from '../kernel';
import {Process, Status} from '../process';
import {SYSCALL} from './index';

export class Interrupt implements SYSCALL{
    public interrupt: number;
    public interruptType: string;
    constructor(id: number, interruptType?: string){
        this.interrupt = id;
        this.interruptType = interruptType || C.INTERRUPT_TYPE.INTERRUPT;
    }
    public run(process: Process): void{
        if(this.interruptType === C.INTERRUPT_TYPE.WAKE){
            process.status = Status.INACTIVE;
        }
        setInterrupt(process, this.interrupt, this.interruptType);
    }
}

export default function interrupt(id: number, interruptType?: string): Interrupt{
    return new Interrupt(id, interruptType);
}
