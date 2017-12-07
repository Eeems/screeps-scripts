import { FS } from './fs';
import { default as memory } from './memory';
import { Priority, Process, Status, ProcessStats } from './process';
import C from './constants';

let processes: {[pid: number]: Process},
    interrupts: {
        [interrupt: number]:  {[interrupt_type: number]: Process[]}
    },
    queue: Process[],
    PID = 0,
    kmem,
    imem;

export type KernelStats  =  ProcessStats & {
    imageName: string,
    args: string[],
    pid: number
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

export function setPID(pid: number){
    PID = pid;
}
export function getStats(pid?: number): {[pid: number]: KernelStats}{
    if(pid === undefined){
        const stats = {};
        eachProcess((process) => {
            stats[process.pid] = _.defaults({
                imageName: process.imageName,
                args: process.args,
                pid: process.pid,
            }, process.cpu);
        });
        stats[-1] = _.defaults({
            imageName: kmem.kernel.imageName,
            args: [],
            pid: -1
        }, kmem.kernel.cpu);
        return stats;
    }else if(pid === -1){
        return kmem.cpu;
    }
    return getProcess(pid).cpu;
}
export function getPID(): number{
    return PID;
}
export function elevated(): boolean{
    return PID === 0;
}
export function setup(){
    memory.setup();
    memory.activate(C.SEGMENTS.KERNEL);
    memory.activate(C.SEGMENTS.INTERRUPT);
}
export function init(){
    const start = Game.cpu.getUsed();
    memory.init();
    reboot();
    if(memory.has(C.SEGMENTS.KERNEL)){
        kmem = memory.get(C.SEGMENTS.KERNEL);
        if(!kmem.cpu){
            kmem.cpu = {
                avg: 0,
                usage: 0,
                runs: 0,
                max: 0
            };
        }
        if(!kmem.kernel){
            kmem.kernel = {
                cpu: {
                    avg: 0,
                    usage: 0,
                    runs: 0,
                    max: 0
                },
                imageName: 'Kernel'
            };
        }
        if(!kmem.processes){
            kmem.processes = [];
        }
        if(!kmem.ram){
            kmem.ram = {};
        }
        loadProcessTable();
        if(memory.has(C.SEGMENTS.INTERRUPT)){
            imem = memory.get(C.SEGMENTS.INTERRUPT);
            if(!imem.interrupts){
                imem.interrupts = [];
            }
            loadInterruptTable();
        }
        if(!processes[0]){
            const process = startProcess('/bin/initd', Priority.Always);
            if(process){
                console.log('Launched /bin/initd');
                if(process.pid !== 0){
                    killProcess(process.pid);
                    console.log('Started with the wrong PID. Killing');
                }
            }
        }
        scheduleProcesses();
        record(Game.cpu.getUsed() - start);
    }
}
export function run(): void{
    if(kmem){
        runInterrupt(C.INTERRUPT.TICKSTART);
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
                            process.run();
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
                    killProcess(process.pid);
                }finally{
                    const usage = Game.cpu.getUsed() - start;
                    process.record(usage);
                    process = queue.shift();
                }
            }
        }
        _.each(Game.creeps, (creep) => runInterrupt(C.INTERRUPT.CREEP, creep));
        runInterrupt(C.INTERRUPT.TICKEND);
    }
}
export function deinit(){
    if(memory.has(C.SEGMENTS.KERNEL)){
        const start = Game.cpu.getUsed();
        saveProcessTable();
        if(memory.has(C.SEGMENTS.INTERRUPT)){
            saveInterruptTable();
        }
        record(Game.cpu.getUsed() - start);
    }
    record();
    runInterrupt(C.INTERRUPT.DEINIT);
    memory.deinit();
}
export function record(usage?: number){
    if(kmem){
        if(!usage){
            usage = Game.cpu.getUsed();
            kmem.cpu.avg = ((kmem.cpu.avg * kmem.cpu.runs) + usage) / (++kmem.cpu.runs);
            kmem.cpu.usage = usage;
            if(usage > kmem.cpu.max){
                kmem.cpu.max = usage;
            }
        }else{
            kmem.kernel.cpu.avg = ((kmem.kernel.cpu.avg * kmem.kernel.cpu.runs) + usage) / (++kmem.kernel.cpu.runs);
            kmem.kernel.cpu.usage = usage;
            if(usage > kmem.kernel.cpu.max){
                kmem.kernel.cpu.max = usage;
            }
        }
    }
}
export function reboot(): void{
        processes = {};
        interrupts = {};
        queue = [];
}
export function getProcessMemory(pid: number): any{
    const ram = kmem.ram;
    if(!(pid in ram)){
        ram[pid] = {};
    }
    return ram[pid];
}
export function startProcess(imageName: string, priority: number, ppid?: number, args: string[] = []): Process{
    if(!elevated()){
        throw new Error('Insufficient privileges');
    }
    if(!FS.hasImage(imageName)){
        throw new Error(`Unable to find image ${imageName}`);
    }
    let pid = 0;
    while(pid in processes){
        pid++;
    }
    const process = new Process(pid, ppid || 0, priority, imageName, Status.ACTIVE, args);
    processes[pid] = process;
    kmem.ram[pid] = {};
    scheduleProcess(process);
    const start = Game.cpu.getUsed();
    setPID(pid);
    try{
        process.setup();
    }catch(e){
        console.log(`Process ${process.pid} (${process.imageName}) failed`);
        console.log(e.message);
        console.log(e.stack);
        killProcess(process.pid);
    }finally{
        setPID(0);
        const usage = Game.cpu.getUsed() - start;
        process.record(usage);
        runInterrupt(C.INTERRUPT.PROCSTART, pid);
    }
    return process;
}
export function killProcess(pid: number, signal?: number): boolean{
    eachProcess((process) => {
        if(process.ppid === pid && process.pid !== pid){
            killProcess(process.pid);
        }
    });
    if(pid in processes){
        runInterrupt(C.INTERRUPT.PROCKILL, pid);
        const process = processes[pid],
            ram = kmem.ram,
            start = Game.cpu.getUsed();
        setPID(pid);
        try{
            process.kill(signal);
        }catch(e){
            console.log(`Process ${process.pid} (${process.imageName}) failed`);
            console.log(e.message);
            console.log(e.stack);
        }finally{
            setPID(0);
            const usage = Game.cpu.getUsed() - start;
            process.record(usage);
        }
        process.status = Status.KILLED;
        _.each(_.keys(interrupts), (interrupt) => {
            _.each(_.keys(interrupts[interrupt]), (interrupt_type) => {
                    const procs = interrupts[interrupt][interrupt_type],
                        idx = procs.indexOf(process);
                    if(~idx){
                        procs.splice(idx, 1);
                    }
            });
        });
        delete processes[pid];
        delete ram[pid];
        return true;
    }
    return false;
}
export function getProcess(pid?: number): Process{
    if(pid === undefined){
        pid = PID;
    }
    return processes[pid];
}
export function getChildProcesses(pid: number): Process[]{
    const res = [];
    eachProcess((process) => {
        if(process.ppid === pid && process.pid !== pid){
            res.push(process);
        }
    });
    return res;
}
export function schedule(){
    queue = _.sortByAll(queue, [
        (process) => -process.priority
    ]);
}
export function scheduleProcesses(): void{
    eachProcess(queue.push.bind(queue));
    schedule();
}
export function scheduleProcess(process: Process): void{
    queue.push(process);
    schedule();
}
export function loadProcessTable(): void{
    processes = {};
    const processData = kmem.processes || [];
    for(const [pid, ppid, imageName, priority, status, sleepInfo, ...args] of processData){
        try{
            const process = new Process(pid, ppid, priority, imageName, status, args);
            processes[pid] = process;
            if(sleepInfo){
                process.sleepInfo = sleepInfo;
            }
        }catch(e){
            console.log(`Error while loading: ${e.message}`);
            console.log(imageName);
        }
    }
}
export function saveProcessTable(): void{
    const table = [];
    eachProcess((process) => {
        if(process.status !== Status.KILLED){
            table.push([
                process.pid,
                process.ppid,
                process.imageName,
                process.priority,
                process.status,
                process.sleepInfo,
                ...process.args
            ]);
        }
    });
    kmem.processes = table;
}
export function loadInterruptTable(){
    interrupts = {};
    const interruptData = imem.interrupts || [];
    for(const [interrupt, interrupt_type, pid] of interruptData){
        const process = processes[pid];
        process && setInterrupt(process, interrupt, interrupt_type);
    }
}
export function saveInterruptTable(){
    const table = [];
    _.each(_.keys(interrupts), (interrupt) => {
        _.each(_.keys(interrupts[interrupt]), (interrupt_type) => {
            _.each(interrupts[interrupt][interrupt_type], (process) => {
                table.push([~~interrupt, interrupt_type, process.pid]);
            });
        });
    });
    imem.interrupts = table;
}
export function setInterrupt(process: Process, interrupt: number, interrupt_type?: number){
    if(!elevated()){
        throw new Error('Insufficient privileges');
    }
    if(!process || process.pid === undefined){
        throw new Error('Process or PID missing');
    }
    if(!interrupts[interrupt]){
        interrupts[interrupt] = {};
    }
    if(interrupt_type === undefined){
        interrupt_type = C.INTERRUPT_TYPE.INTERRUPT;
    }
    if(!interrupts[interrupt][interrupt_type]){
        interrupts[interrupt][interrupt_type] = [];
    }
    const processes = interrupts[interrupt][interrupt_type];
    if(!~processes.indexOf(process)){
        processes.push(process);
    }
}
export function runInterrupt(interrupt: number, signal?: any){
    if(!elevated()){
        throw new Error('Insufficient privileges');
    }
    if(interrupts[interrupt]){
        _.each(_.keys(interrupts[interrupt]), (interrupt_type) => {
            _.each(interrupts[interrupt][interrupt_type], (process, i) => {
                if(~~interrupt_type === C.INTERRUPT_TYPE.WAKE){
                    process.status = Status.ACTIVE;
                    interrupts[interrupt][interrupt_type].splice(i, 1);
                }
                const args = [interrupt, interrupt_type, signal],
                    start = Game.cpu.getUsed();
                setPID(process.pid);
                try{
                    if(~~interrupt_type === C.INTERRUPT_TYPE.WAKE){
                        process.wake.apply(process, args);
                    }else{
                        process.interrupt.apply(process, args);
                    }
                }catch(e){
                    console.log(`Process ${process.pid} (${process.imageName}) failed`);
                    console.log(e.message);
                    console.log(e.stack);
                    setPID(0);
                    killProcess(process.pid);
                }finally{
                    const usage = Game.cpu.getUsed() - start;
                    process.record(usage);
                }
            });
        });
        setPID(0);
    }
}
