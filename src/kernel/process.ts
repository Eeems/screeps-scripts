import { FS } from './fs';
import { getChildProcesses, getProcess, getProcessMemory } from './kernel';
import {default as Image, ImageProps} from './image';

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
    public constructor(
        pid: number, ppid: number, priority: number, imageName: string, status: Status, args: string[] = []
    ){
        this.pid = pid;
        this.ppid = ppid;
        this.priority = priority;
        this.status = status;
        this.args = args;
        this.cpu = {
            avg: 0,
            max: 0,
            runs: 0,
            usage: 0
        };
        this._imageName = imageName;
        this.memory = getProcessMemory(pid);
        const image = FS.open(imageName) as Image;
        for(const name of ImageProps){
            if(name in image){
                this[name] = image[name].bind(this);
            }else{
                this[name] = () => {/*empty*/};
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
        this.cpu.avg = ((this.cpu.avg * this.cpu.runs) + usage) / (++this.cpu.runs);
        this.cpu.usage = usage;
        if(usage > this.cpu.max){
            this.cpu.max = usage;
        }
    }
}
