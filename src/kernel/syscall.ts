import {startProcess, setInterrupt, getPID, killProcess, getProcess, setPID} from './kernel';
import {Status} from './process';
import C from './constants';

let PID;

function trust(trusted: boolean){
    if(trusted){
        PID = getPID();
        setPID(0);
    }else{
        setPID(PID);
    }
}

export function fork(priority: number, imageName: string, args: string[] = []){
    trust(true);
    const child = startProcess(imageName, priority, PID, args);
    trust(false);
    return child ? child.pid : false;
}

export function interrupt(interrupt: number, interruptType?: string){
    const process = getProcess();
    if(interruptType === C.INTERRUPT_TYPE.WAKE){
        process.status = Status.INACTIVE;
    }
    trust(true);
    setInterrupt(process, interrupt, interruptType);
    trust(false);
}

export function kill(status: number = 0){
    trust(true);
    killProcess(PID, status);
    trust(false);
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
