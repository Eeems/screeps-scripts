import { FS } from './fs';
import {ImageProps} from './image';
import { getChildProcesses, getProcess, getProcessMemory } from './kernel';

export enum Priority {
    Immediate = -1,
    Always = 0,
    AlwaysLast = 1,
    Sometimes = 2
}

export enum Status {
    KILLED = -1,
    SLEEP = 0,
    ACTIVE = 1,
    INACTIVE = 2
}

export type ProcessStats = {
    avg: number,
    usage: number,
    runs: number,
    max: number
};

export class Process{
    public pid: number;
    public ppid: number;
    public priority: number | Priority;
    public status: number;
    public args: string[];
    public sleepInfo: {
        start: number,
        duration: number
    };
    public signal;
    public cpu: ProcessStats;
    public setup: any;
    public run: any;
    public interrupt: any;
    public wake: any;
    public kill: any;
    public memory: any;
    private _imageName: string;
    public constructor(pid: number, ppid: number, priority: number, imageName: string, status: Status, args: string[] = []){
        this.pid = pid;
        this.ppid = ppid;
        this.priority = priority;
        this.status = status;
        this.args = args;
        this.cpu = {
            avg: 0,
            usage: 0,
            runs: 0,
            max: 0
        };
        this._imageName = imageName;
        this.memory = getProcessMemory(pid);
        const image = FS.getImage(imageName);
        for(const name of ImageProps){
            if(name in image){
                this[name] = image[name].bind(this);
            }else{
                this[name] = () => {};
            }
        }
    }
    public get imageName(){
        return this._imageName;
    }
    public get parent(){
        return getProcess(this.ppid);
    }
    public get children(){
        return getChildProcesses(this.pid);
    }
    public record(usage: number){
        this.cpu.runs++;
        this.cpu.avg = (this.cpu.avg + usage) / 2;
        this.cpu.usage = usage;
        if(usage > this.cpu.max){
            this.cpu.max = usage;
        }
    }
}
