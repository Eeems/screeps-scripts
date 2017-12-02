import { profile } from '../profiler/Profiler';

@profile
export class Process{
    public pid: number;
    public ppid: number;
    public priority: number;
    public status: number;
    protected memory: any;
    public sleepInfo: {start: number, duration: number};
    public constructor(pid: number, ppid: number, priority: number){
        this.pid = pid;
        this.ppid = ppid;
        this.priority = priority;
        this.status = Status.ACTIVE;
    }
    public setMemory(memory: any){
        this.memory = memory;
    }
}

export module Priority {
    export const Always = 0;
    export const AlwaysLast = 1;
    export const Sometimes = 2;
}

export module Status {
    export const SLEEP = 0;
    export const ACTIVE = 1;
    export const INACTIVE = 2;
}
