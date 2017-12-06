import * as SYSCALL from '../kernel/syscall/';
import { default as  memory } from '../kernel/memory';
import * as Profiler from '../profiler/Profiler';
import {getStats, KernelStats} from '../kernel/kernel';
import C from '../kernel/constants';

export default {
    setup: function*(){
        yield SYSCALL.interrupt(C.INTERRUPT.TICKEND);
    },
    next: function(): void{
        if(!global.Profiler){
            global.Profiler = Profiler.init();
        }
        const profiler = global.Profiler,
            pmem = memory.get(C.SEGMENTS.PROFILER);
        if(pmem && !pmem.start){
            profiler.start();
        }
    },
    interrupt: function(): void{
        // profiler.output();
        const stats = getStats() as {[pid: number]: KernelStats},
            longest = (_.max(stats, (i: KernelStats) => i.imageName.length).imageName || '').length;
        console.log(`${_.padRight('PID', 3)} ${_.padRight('PROCESS', longest)} AVERAGE CPU`);
        _.each(stats, (cpu: KernelStats, pid) => {
            console.log(`${_.padRight(pid, 3)} ${_.padRight(cpu.imageName, longest)} ${cpu.avg.toPrecision(3)}`);
        });
    }
};
