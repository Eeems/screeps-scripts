import * as SYSCALL from '../kernel/syscall';
import {getStats, KernelStats} from '../kernel/kernel';
import C from '../kernel/constants';

export default {
    setup: function(){
        SYSCALL.interrupt(C.INTERRUPT.DEINIT);
    },
    interrupt: function(): void{
        const stats = _.sortBy(
                getStats() as {[pid: number]: KernelStats},
                (cpu: KernelStats) => cpu.usage
            ),
            longest = (_.max(stats, (i: KernelStats) => i.imageName.length).imageName || '').length,
            total = getStats(-1) as KernelStats;
        console.log(`${_.padRight('PID', 3)} ${_.padRight('PROCESS', longest)} CURRENT AVERAGE ARGS`);
        _.each(stats, (cpu: KernelStats) => {
            console.log(`${_.padLeft(cpu.pid+'', 3)} ${_.padRight(cpu.imageName, longest)} ${_.padLeft(cpu.usage.toFixed(3), 7)} ${_.padLeft(cpu.avg.toFixed(3), 7)} ${cpu.args.join(' ')}`);
        });
        console.log(`TOTAL: ${total.usage.toFixed(3)} AVERAGE: ${total.avg.toFixed(3)} MAX: ${total.max.toFixed(3)}`);
    }
};
