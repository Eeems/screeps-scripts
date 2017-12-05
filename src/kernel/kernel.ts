import * as Profiler from '../profiler/Profiler';
import { wrap } from '../profiler/Profiler';
import { FS } from './fs';
import { default as memory } from './memory';
import { Priority, Process, Status, ProcessStats } from './process';
import * as SYSCALL from './syscall';
import C from './constants';

let processes: {[pid: number]: Process},
    queue: Process[],
    PID = 0,
    kmem;

export type KernelStats  =  ProcessStats & {
    imageName: string
};

export function getStats(pid?: number): {[pid: number]: KernelStats}{
    if(pid === undefined){
        const stats = {};
        eachProcess((process) => {
            stats[process.pid] = _.defaults({
                imageName: process.imageName
            }, process.cpu);
        });
        return stats;
    }
    return getProcess(pid).cpu;
}
function setPID(pid: number){
    PID = pid;
}
export function getPID(): number{
    return PID;
}
export function elavated(): boolean{
    return PID === 0;
}
export function run(): void{
    if(kmem){
        const yieldInstance = new SYSCALL.Yield();
        while(queue.length){
            let process = queue.shift();
            while(process){
                const start = Game.cpu.getUsed();
                try{
                    setPID(process.pid);
                    if(!process.parent){
                        killProcess(process.pid);
                    }
                    switch(process.status){
                        case Status.SLEEP:
                            const sleepInfo = process.sleepInfo;
                            if(
                                sleepInfo!.start + sleepInfo!.duration < Game.time &&
                                sleepInfo!.duration !== -1
                            ){
                                process.status = Status.ACTIVE;
                                process.sleepInfo = undefined;
                            }else{
                                break;
                            }
                        case Status.ACTIVE:
                            const res = process.next(process.signal);
                            const syscall = res.value || yieldInstance;
                            if(SYSCALL.isSYSCALL(syscall) && 'run' in syscall){
                                process.signal = syscall.run(process);
                            }
                            if(!res.done){
                                queue.push(process);
                            }
                            break;
                        case Status.INACTIVE:case Status.KILLED:
                        default:
                            break;
                    }
                    setPID(0);
                }catch(e){
                    console.log(`Process ${process.pid} (${process.imageName}) failed`);
                    console.log(e.message);
                    console.log(e.stack);
                }finally{
                    const usage = Game.cpu.getUsed() - start;
                    Profiler.record(process.imageName, usage);
                    process.record(usage);
                    process = queue.shift();
                }
            }
        }
    }
}
export function setup(){
    memory.setup();
    memory.activate(C.SEGMENTS.KERNEL);
};
export function init(){
    memory.init();
    if(
        !global.Profiler ||
        !memory.has(C.SEGMENTS.PROFILER)
    ){
        global.Profiler = Profiler.init();
    }
    if(memory.has(C.SEGMENTS.KERNEL)){
        kmem = memory.get(C.SEGMENTS.KERNEL);
        if(!kmem.processes){
            kmem.processes = [];
        }
        if(!kmem.ram){
            kmem.ram = {};
        }
        loadProcessTable();
        scheduleProcesses();
    }
}
export function deinit(){
    if(memory.has(C.SEGMENTS.KERNEL)){
        saveProcessTable();
    }
    memory.deinit();
};
function eachProcess(fn){
    _.each(_.keys(processes), (pid) => {
        const process = processes[pid];
        if(process instanceof Process){
            fn(process);
        }else{
            console.log(`Warning: Invalid process: ${pid}`);
        }
    });
}

export const reboot = wrap((): void => {
        processes = {};
        queue = [];
    }, 'Kernel'),
    getProcessMemory = wrap((pid: number): any => {
        const ram = kmem.ram;
        if(!(pid in ram)){
            ram[pid] = {};
        }
        return ram[pid];
    }, 'Kernel'),
    startProcess = wrap((imageName: string, priority: number, ppid?: number): Process => {
        if(FS.hasImage(imageName)){
            let pid = 0;
            while(pid in processes){
                pid++;
            }
            const process = new Process(pid, ppid || 0, priority, imageName);
            processes[pid] = process;
            kmem.ram[pid] = {};
            scheduleProcess(process);
            return process;
        }
    }, 'Kernel'),
    killProcess = wrap((pid: number): boolean => {
        eachProcess((process) => {
            if(process.ppid === pid && process.pid !== pid){
                killProcess(process.pid);
            }
        });
        if(pid in processes){
            const process = processes[pid],
                ram = kmem.ram;
            process.status = Status.KILLED;
            delete processes[pid];
            delete ram[pid];
            return true;
        }
        return false;
    }, 'Kernel'),
    getProcess = wrap((pid: number): Process => {
        return processes[pid];
    }, 'Kernel'),
    getChildProcesses = wrap((pid: number): Process[] => {
        const res = [];
        eachProcess((process) => {
            if(process.ppid === pid && process.pid !== pid){
                res.push(process);
            }
        });
        return res;
    }, 'Kernel'),
    schedule = wrap(() => {
        queue = _.sortByAll(queue, [
            (process) => -process.priority
        ]);
    }, 'Kernel'),
    scheduleProcesses = wrap((): void => {
        eachProcess(queue.push.bind(queue));
        schedule();
    }, 'Kernel'),
    scheduleProcess = wrap((process: Process): void => {
        queue.push(process);
        schedule();
    }, 'Kernel'),
    loadProcessTable = wrap((): void => {
        reboot();
        const processData = kmem.processes;
        for(const item of processData){
            const [pid, ppid, imageName, priority, ...remaining] = item;
            try{
                const process = new Process(pid, ppid, priority, imageName);
                process.setMemory(getProcessMemory(pid));
                processes[pid] = process;
                const sleepInfo = remaining.pop();
                if(sleepInfo){
                    process.sleepInfo = sleepInfo;
                    process.status = Status.SLEEP;
                }
            }catch(e){
                console.log(`Error while loading: ${e.message}`);
                console.log(imageName);
            }
        }
        if(!processes[0]){
            console.log('Launching /bin/initd');
            startProcess('/bin/initd', Priority.Always);
        }
    }, 'Kernel'),
    saveProcessTable = wrap((): void => {
        const table = [];
        eachProcess((process) => {
            if(process.status !== Status.KILLED){
                table.push([
                    process.pid,
                    process.ppid,
                    process.imageName,
                    process.priority,
                    process.sleepInfo
                ]);
            }
        });
        kmem.processes = table;
    }, 'Kernel');
