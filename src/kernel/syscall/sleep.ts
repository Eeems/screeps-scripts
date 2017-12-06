import {Process, Status} from '../process';
import {SYSCALL} from './index';

export class Sleep implements SYSCALL{
    public ticks: number;
    constructor(ticks: number){
        this.ticks = ticks;
    }
    public run(process: Process): void{
        process.status = Status.SLEEP;
        process.sleepInfo = {
            duration: this.ticks,
            start: Game.time
        };
    }
}

export default function sleep(ticks: number){
    return new Sleep(ticks);
}
