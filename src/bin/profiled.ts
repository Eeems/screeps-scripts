import * as SYSCALL from '../kernel/syscall';
import {getStats, KernelStats} from '../kernel/kernel';
import C from '../kernel/constants';

export default {
    setup: function(){
        SYSCALL.interrupt(C.INTERRUPT.TICKEND);
    },
    interrupt: function(): void{
        const stats = getStats() as {[pid: number]: KernelStats},
            longest = (_.max(stats, (i: KernelStats) => i.imageName.length).imageName || '').length;
        console.log(`${_.padRight('PID', 3)} ${_.padRight('PROCESS', longest)} AVERAGE CPU`);
        _.each(stats, (cpu: KernelStats, pid) => {
            console.log(`${_.padRight(pid, 3)} ${_.padRight(cpu.imageName, longest)} ${cpu.avg.toPrecision(3)}`);
        });
    }
};
