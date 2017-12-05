import {Priority} from '../kernel/process';
import * as SYSCALL from '../kernel/syscall/';
import { default as  memory } from '../kernel/memory';
import * as Profiler from '../profiler/Profiler';
import {getStats, KernelStats} from '../kernel/kernel';
import C from '../kernel/constants';

function* main(): IterableIterator<any>{
    if(!global.Profiler){
        global.Profiler = Profiler.init();
    }
    const profiler = global.Profiler,
        pmem = memory.get(C.SEGMENTS.PROFILER);
    if(pmem && !pmem.start){
        profiler.start();
    }
    yield new SYSCALL.Priority(Priority.Sometimes);
    // profiler.output();
    const stats = getStats() as {[pid: number]: KernelStats},
        longest = (_.max(stats, (i: KernelStats) => i.imageName.length).imageName || '').length;
    console.log(`${_.padRight('PID', 3)} ${_.padRight('PROCESS', longest)} AVERAGE CPU`);
    _.each(stats, (cpu: KernelStats, pid) => {
        console.log(`${_.padRight(pid, 3)} ${_.padRight(cpu.imageName, longest)} ${cpu.avg.toPrecision(3)}`);
    });
    return new SYSCALL.Priority(Priority.Always);
}

export default main;
