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
export enum Priority {
    Always = 0,
    AlwaysLast = 1,
    Sometimes = 2
};

export enum Status {
    SLEEP = 0,
    ACTIVE = 1,
    INACTIVE = 2
}
