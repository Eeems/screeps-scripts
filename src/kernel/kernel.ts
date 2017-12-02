import { Process, Priority, Status } from './process';
import { default as FS } from './fs';

Memory.kernel = Memory.kernel || {
    memory: {},
    processes: []
};
let processTable: {[pid: number]: Process},
    alwaysQueue: Process[],
    lastQueue: Process[],
    sometimesQueue: Process[];

export function reboot(){
    processTable = {};
    alwaysQueue = [];
    lastQueue = [];
    sometimesQueue = [];
}
function getProcessMemory(pid: number): any{
    Memory.kernel.memory = Memory.kernel.memory || {};
    Memory.kernel.memory[pid] =  Memory.kernel.memory[pid] || {};
    return Memory.kernel.memory[pid];
}
export function loadProcessTable(){
    reboot();
    processTable;
    Memory.kernel.processes = Memory.kernel.processes || [];
    for(let item of Memory.kernel.processes){
        let [pid, ppid, imageName, priority, ...remaining] = item;
        try{
            let ProcessClass = FS.getImage(imageName),
                memory = getProcessMemory(pid),
                process = new ProcessClass(pid, ppid, priority) as Process;
            process.setMemory(memory);
            processTable[pid] = process;
            const sleepInfo = remaining.pop();
            if(sleepInfo){
                process.sleepInfo = sleepInfo;
                process.status = Status.SLEEP;
            }
            if(priority === Priority.Always){
                alwaysQueue.push(process);
            }else if(priority === Priority.AlwaysLast){
                lastQueue.push(process);
            }else if(priority === Priority.Sometimes){
                sometimesQueue.push(process);
            }
        }catch(e){
            console.log(`Error while loading: ${e.message}`);
            console.log(imageName);
        }
    }
}
