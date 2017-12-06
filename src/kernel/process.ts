import { FS } from './fs';
import {default as Image, ImageProps} from './image';
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
    private _image: Image;
    private _setup: Iterator<any>;
    private _next: Iterator<any>;
    private _interrupt: Iterator<any>;
    private _wake: Iterator<any>;
    private _kill: Iterator<any>;
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
    public setMemory(memory: any){
        this.memory = memory;
    }
    private get image(){
        if(this._image === undefined){
            const image = _.defaultsDeep({}, FS.getImage(this.imageName));
            for(let name of ImageProps){
                if(name in image){
                    image[name] = image[name].bind(this);
                }
            }
            this._image = image;
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
    public setup(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image || !this.image.setup){
            return {
                done: true,
                value: 0
            };
        }
        if(!this._setup){
            this._setup = this.image.setup();
        }
        const res = this._setup.next(signal);
        return {
            done: res.done,
            value: res.value || 0
        };
    }
    public next(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image || !this.image.next){
            return {
                done: true,
                value: 0
            };
        }
        if(!this._next){
            this._next = this.image.next();
        }
        const res = this._next.next(signal);
        return {
            done: res.done,
            value: res.value || 0
        };
    }
    public interrupt(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image || !this.image.interrupt){
            return {
                done: true,
                value: 0
            };
        }
        if(!this._interrupt){
            this._interrupt = this.image.interrupt();
        }
        const res = this._interrupt.next(signal);
        return {
            done: res.done,
            value: res.value || 0
        };
    }
    public wake(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image || !this.image.wake){
            return {
                done: true,
                value: 0
            };
        }
        if(!this._wake){
            this._wake = this.image.wake();
        }
        const res = this._wake.next(signal);
        return {
            done: res.done,
            value: res.value || 0
        };
    }
    public kill(signal?: any): IteratorResult<any>{
        this.signal = signal;
        if(!this.image || !this.image.kill){
            return {
                done: true,
                value: 0
            };
        }
        if(!this._kill){
            this._kill = this.image.kill();
        }
        const res = this._kill.next(signal);
        return {
            done: res.done,
            value: res.value || 0
        };
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
