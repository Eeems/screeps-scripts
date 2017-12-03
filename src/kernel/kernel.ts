import { Process, Priority, Status } from './process';
import { default as FS } from './fs';
import { default as memory } from './memory';

let processes: {[pid: number]: Process},
    alwaysQueue: Process[],
    lastQueue: Process[],
    sometimesQueue: Process[];

export function reboot(){
    processes = {};
    alwaysQueue = [];
    lastQueue = [];
    sometimesQueue = [];
}
function getProcessMemory(pid: number): any{
    let ram = memory.get('ram');
    if(!(pid in ram)){
        ram[pid] = {}
    }
    return ram[pid];
}
export function loadProcessTable(){
    reboot();
    for(let item of (memory.get('processes') || [])){
        let [pid, ppid, imageName, priority, ...remaining] = item;
        try{
            let ProcessClass = FS.getImage(imageName),
                process = new ProcessClass(pid, ppid, priority) as Process;
            process.setMemory(getProcessMemory(pid));
            processes[pid] = process;
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
