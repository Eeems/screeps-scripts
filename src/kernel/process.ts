import { profile } from '../profiler/Profiler';
import { FS } from './fs';
import { getChildProcesses, getProcess } from './kernel';

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
    public sleepInfo: {
        start: number,
        duration: number
    };
    public signal;
    public cpu: ProcessStats;
    protected memory: any;
    private _imageName: any;
    private _image: IterableIterator<any>;
    public constructor(pid: number, ppid: number, priority: number, imageName: string){
        this.pid = pid;
        this.ppid = ppid;
        this.priority = priority;
        this.status = Status.ACTIVE;
        this._imageName = imageName;
        this.cpu = {
            avg: 0,
            usage: 0,
            runs: 0,
            max: 0
        };
    }
    @profile
    public setMemory(memory: any){
        this.memory = memory;
    }
    private get image(){
        if(this._image === undefined){
            const image = FS.getImage(this.imageName).bind(this);
            this._image = image();
        }
        return this._image;
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
    public next(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image){
            return {
                done: true,
                value: 0
            };
        }
        const res = this.image.next(signal);
        return {
            done: res.done,
            value: res.value || 0
        };
    }
    public return(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image){
            return {
                done: true,
                value: signal
            };
        }
        const res = this.image.return(signal);
        return {
            done: true,
            value: res.value || signal || 0
        };
    }
    public throw(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image){
            return {
                done: true,
                value: signal
            };
        }
        return this.image.throw(signal);
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
