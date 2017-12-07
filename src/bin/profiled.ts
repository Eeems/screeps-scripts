import * as SYSCALL from '../kernel/syscall';
import {getStats, KernelStats, getProcess} from '../kernel/kernel';
import C from '../kernel/constants';

export default {
    setup: function(){
        SYSCALL.interrupt(C.INTERRUPT.DEINIT);
    },
    interrupt: function(): void{
        const stats = getStats() as {[pid: number]: KernelStats},
            longest = (_.max(stats, (i: KernelStats) => i.imageName.length).imageName || '').length,
            total = getStats(-1) as KernelStats;
        console.log(`${_.padRight('PID', 3)} ${_.padRight('PROCESS', longest)} CURRENT AVERAGE ARGS`);
        _.each(stats, (cpu: KernelStats, pid) => {
            console.log(`${_.padRight(pid, 3)} ${_.padRight(cpu.imageName, longest)} ${_.padRight(cpu.usage.toPrecision(3), 7)} ${_.padRight(cpu.avg.toPrecision(3), 7)} ${getProcess(~~pid).args.join(' ')}`);
        });
        console.log(`TOTAL: ${total.usage.toPrecision(3)} AVERAGE: ${total.avg.toPrecision(3)} MAX: ${total.max.toPrecision(3)} TICK: ${total.runs}`);
    }
};
