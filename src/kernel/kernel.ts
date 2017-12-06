import * as Profiler from '../profiler/Profiler';
import { wrap } from '../profiler/Profiler';
import { FS } from './fs';
import { default as memory } from './memory';
import { Priority, Process, Status, ProcessStats } from './process';
import * as SYSCALL from './syscall';
import C from './constants';

let processes: {[pid: number]: Process},
    interrupts: {
        [interrupt: number]:  {[interrupt_type: string]: Process[]}
    },
    queue: Process[],
    PID = 0,
    kmem,
    imem;

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
export function setup(){
    memory.setup();
    memory.activate(C.SEGMENTS.KERNEL);
    memory.activate(C.SEGMENTS.INTERRUPT);
};
export function init(){
    memory.init();
    if(
        !global.Profiler ||
        !memory.has(C.SEGMENTS.PROFILER)
    ){
        global.Profiler = Profiler.init();
    }
    reboot();
    if(memory.has(C.SEGMENTS.KERNEL)){
        kmem = memory.get(C.SEGMENTS.KERNEL);
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
    }
}
export function run(): void{
    if(kmem){
        runInterrupt(C.INTERRUPT.TICK);
        const noopSYSCALL = {};
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
                            const res = process.next(process.signal),
                                syscall = res.value || noopSYSCALL;
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
                    killProcess(process.pid);
                }finally{
                    const usage = Game.cpu.getUsed() - start;
                    Profiler.record(process.imageName, usage);
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
        saveProcessTable();
    }
    if(memory.has(C.SEGMENTS.INTERRUPT)){
        saveInterruptTable();
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
        interrupts = {};
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
            const start = Game.cpu.getUsed(),
                noopSYSCALL = {};
            try{
                let res, signal;
                do{
                    res = process.setup(signal);
                    const syscall = res.value || noopSYSCALL;
                    if(SYSCALL.isSYSCALL(syscall) && 'run' in syscall){
                        process.signal = signal = syscall.run(process);
                    }
                }while(!res.done);
            }catch(e){
                console.log(`Process ${process.pid} (${process.imageName}) failed`);
                console.log(e.message);
                console.log(e.stack);
                killProcess(process.pid);
            }finally{
                const usage = Game.cpu.getUsed() - start;
                Profiler.record(process.imageName, usage);
                process.record(usage);
            }
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
                ram = kmem.ram,
                start = Game.cpu.getUsed(),
                noopSYSCALL = {};
            try{
                let res, signal;
                do{
                    res = process.setup(signal);
                    const syscall = res.value || noopSYSCALL;
                    if(SYSCALL.isSYSCALL(syscall) && 'run' in syscall){
                        process.signal = signal = syscall.run(process);
                    }
                }while(!res.done);
            }catch(e){
                console.log(`Process ${process.pid} (${process.imageName}) failed`);
                console.log(e.message);
                console.log(e.stack);
            }finally{
                const usage = Game.cpu.getUsed() - start;
                Profiler.record(process.imageName, usage);
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
        // @todo determine if this is slower than lodash in node 8
        processes = {};
        const processData = kmem.processes || [];
        for(const [pid, ppid, imageName, priority, ...remaining] of processData){
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
    }, 'Kernel'),
    loadInterruptTable = wrap(() => {
        // @todo determine if this is slower than lodash in node 8
        interrupts = {};
        const interruptData = imem.interrupts || [];
        for(const [interrupt, interrupt_type, pid] of interruptData){
            const process = processes[pid];
            process && setInterrupt(process, interrupt, interrupt_type);
        }
    }, 'Kernel'),
    saveInterruptTable = wrap(() => {
        // @todo determine if this is slower than lodash in node 8
        const table = [];
        _.each(_.keys(interrupts), (interrupt) => {
            _.each(_.keys(interrupts[interrupt]), (interrupt_type) => {
                _.each(interrupts[interrupt][interrupt_type], (process) => {
                    table.push([interrupt, interrupt_type, process.pid]);
                });
            });
        });
        imem.interrupts = table;
    }, 'Kernel'),
    setInterrupt = wrap((process: Process, interrupt: number, interrupt_type?: string) => {
        if(!elavated()){
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
    }),
    runInterrupt = wrap((interrupt: number, signal?: any) => {
        if(!elavated()){
            throw new Error('Insufficient privileges');
        }
        if(interrupts[interrupt]){
            // @todo determine if this is slower than lodash in node 8
            const noopSYSCALL = {};
            _.each(_.keys(interrupts[interrupt]), (interrupt_type) => {
                _.each(interrupts[interrupt][interrupt_type], (process) => {
                    const fn = process[interrupt_type].bind(process);
                    if(interrupt_type === C.INTERRUPT_TYPE.WAKE){
                        process.status = Status.ACTIVE;
                    }
                    signal = {
                        interrupt: interrupt,
                        signal: signal
                    };
                    const start = Game.cpu.getUsed();
                    try{
                        let res;
                        do{
                            res = fn(signal);
                            const syscall = res.value || noopSYSCALL;
                            if(SYSCALL.isSYSCALL(syscall) && 'run' in syscall){
                                process.signal = signal = syscall.run(process);
                            }
                        }while(!res.done);
                    }catch(e){
                        console.log(`Process ${process.pid} (${process.imageName}) failed`);
                        console.log(e.message);
                        console.log(e.stack);
                        killProcess(process.pid);
                    }finally{
                        const usage = Game.cpu.getUsed() - start;
                        Profiler.record(process.imageName, usage);
                        process.record(usage);
                    }
                });
            });
        }
    }, 'Kernel');
