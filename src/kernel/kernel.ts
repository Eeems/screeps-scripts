import * as Profiler from '../profiler/Profiler';
import { wrap } from '../profiler/Profiler';
import { FS } from './fs';
import { default as memory } from './memory';
import { Priority, Process, Status } from './process';
import * as SYSCALL from './syscall';

let processes: {[pid: number]: Process},
    alwaysQueue: Process[],
    lastQueue: Process[],
    sometimesQueue: Process[],
    PID = 0;

function runQueue(queue: Process[]): void{
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
                Profiler.record(process.imageName, Game.cpu.getUsed() - start);
                process = queue.shift();
            }
        }
    }
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
    runQueue(alwaysQueue);
    runQueue(lastQueue);
    runQueue(sometimesQueue);
}
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
        alwaysQueue = [];
        lastQueue = [];
        sometimesQueue = [];
    }, 'Kernel'),
    getProcessMemory = wrap((pid: number): any => {
        const ram = memory.get('ram');
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
            memory.get('ram')[pid] = {};
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
                ram = memory.get('ram');
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
    schedule = wrap((): void => {
        eachProcess(scheduleProcess);
    }, 'Kernel'),
    scheduleProcess = wrap((process: Process): void => {
        switch(process.priority){
            case Priority.Always:
                alwaysQueue.push(process);
                break;
            case Priority.AlwaysLast:
                lastQueue.push(process);
                break;
            case Priority.Sometimes:default:
                sometimesQueue.push(process);
                break;
        }
    }, 'Kernel'),
    loadProcessTable = wrap((): void => {
        reboot();
        if(!memory.has('processes')){
            memory.set('processes', []);
        }
        const processData = memory.get('processes');
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
        memory.set('processes', table);
    }, 'Kernel');
