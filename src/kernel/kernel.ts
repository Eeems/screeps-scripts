import { profile } from '../profiler/Profiler';
import { Process, Priority, Status } from './process';

@profile
export class Kernel {
    private processTable: {[pid: number]: Process};
    private alwaysQueue: Process[];
    private lastQueue: Process[];
    private sometimesQueue: Process[];
    public constructor(){
        this.reboot();
    }
    public reboot(){
        this.processTable = {};
        this.alwaysQueue = [];
        this.lastQueue = [];
        this.sometimesQueue = [];
    }
    private getProcessMemory(pid: number): any{
        Memory.kernel.memory = Memory.kernel.memory || {};
         Memory.kernel.memory[pid] =  Memory.kernel.memory[pid] || {};
        return Memory.kernel.memory[pid];
    }
    public loadProcessTable(){
        this.reboot();
        this.processTable;
        Memory.kernel.processes = Memory.kernel.processes || [];
        for(let item of Memory.kernel.processes){
            let [pid, ppid, classPath, priority, ...remaining] = item;
            try{
                let ProcessClass = require(classPath),
                    memory = this.getProcessMemory(pid),
                    process = new ProcessClass(pid, ppid, priority) as Process;
                process.setMemory(memory);
                this.processTable[pid] = process;
                const sleepInfo = remaining.pop();
                if(sleepInfo){
                    process.sleepInfo = sleepInfo;
                    process.status = Status.SLEEP;
                }
                if(priority === Priority.Always){
                    this.alwaysQueue.push(process);
                }else if(priority === Priority.AlwaysLast){
                    this.lastQueue.push(process);
                }else if(priority === Priority.Sometimes){
                    this.sometimesQueue.push(process);
                }
            }catch(e){
                console.log(`Error while loading: ${e.message}`);
                console.log(classPath);
            }
        }
    }
}
