import {startProcess, setInterrupt, getPID, killProcess, getProcess, setPID} from './kernel';
import {Status} from './process';
import C from './constants';

function trust(){
    const PID = getPID();
    setPID(0);
    return PID;
}

export function fork(priority: number, imageName: string, args: string[] = []){
    const PID = trust();
    const child = startProcess(imageName, priority, PID, args);
    setPID(PID);
    return child ? child.pid : false;
}

export function interrupt(interrupt: number, interruptType?: string){
    const process = getProcess();
    if(interruptType === C.INTERRUPT_TYPE.WAKE){
        process.status = Status.INACTIVE;
    }
    const PID = trust();
    setInterrupt(process, interrupt, interruptType);
    setPID(PID);
}

export function kill(status: number = 0){
    const PID = trust();
    killProcess(PID, status);
    setPID(PID);
}

export function priority(priority: number){
    getProcess().priority = priority;
}

export function sleep(ticks: number){
    const process = getProcess();
    process.status = Status.SLEEP;
    process.sleepInfo = {
        duration: ticks,
        start: Game.time
    };
}
