import * as Profiler from '../profiler/Profiler';
import { wrap } from '../profiler/Profiler';
import { FS } from './fs';
import { default as memory } from './memory';
import { Priority, Process, Status } from './process';

let processes: {[pid: number]: Process},
    alwaysQueue: Process[],
    lastQueue: Process[],
    sometimesQueue: Process[];
function runQueue(queue: Process[]): void{
    while(queue.length){
        let process = queue.pop();
        while(process){
            const start = Game.cpu.getUsed();
            try{
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
                        const res = process.next();
                        if(!res.done){
                            queue.push(process);
                        }
                        break;
                    case Status.INACTIVE:case Status.KILLED:
                    default:
                        break;
                }
            }catch(e){
                console.log(`Process ${process.pid} (${process.imageName}) failed`);
                console.log(e.message);
                console.log(e.stack);
            }finally{
                Profiler.record(process.imageName, Game.cpu.getUsed() - start);
                process = queue.pop();
            }
        }
    }
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
        }
    });
}

export const reboot = wrap((): void => {
        processes = {};
        alwaysQueue = [];
        lastQueue = [];
        sometimesQueue = [];
    }, 'Kernel:reboot'),
    getProcessMemory = wrap((pid: number): any => {
        const ram = memory.get('ram');
        if(!(pid in ram)){
            ram[pid] = {};
        }
        return ram[pid];
    }, 'Kernel:getProcessMemory'),
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
    }, 'Kernel:startProcess'),
    killProcess = wrap((pid: number): boolean => {
        if(pid in processes){
            const process = processes[pid],
                ram = memory.get('ram');
            process.status = Status.KILLED;
            delete processes[pid];
            delete ram[pid];
            return true;
        }
        return false;
    }, 'Kernel:killProcess'),
    getProcess = wrap((pid: number): Process => {
        return processes[pid];
    }, 'Kernel:getProcess'),
    schedule = wrap((): void => {
        eachProcess((process) => {
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
        });
    }, 'Kernel:schedule'),
    loadProcessTable = wrap((): void => {
        reboot();
        if(!memory.has('processes')){
            memory.set('processes', []);
        }
        const processData = memory.get('processes');
        if(!processData.length){
            startProcess('/bin/initd', Priority.Always);
        }
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
    }, 'Kernel:loadProcessTable'),
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
    }, 'Kernel:saveProcessTable');
