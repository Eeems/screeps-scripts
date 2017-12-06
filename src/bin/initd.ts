import {Priority, Process} from '../kernel/process';
import C from '../kernel/constants';
import * as SYSCALL from '../kernel/syscall';

function ensureProcess(priority: Priority, imageName: string, args: string[] = []): void{
    if(!_.filter(this.children, (process: Process) => imageName === process.imageName && args.join(' ') === process.args.join(' ')).length){
        console.log(`Launching ${imageName}`);
        if(!SYSCALL.fork(priority, imageName, args)){
            console.log(`Unable to launch ${imageName}`);
        }
    }
}

export default {
    setup: function(): void{
        SYSCALL.interrupt(C.INTERRUPT.TICKSTART);
        SYSCALL.interrupt(C.INTERRUPT.PROCKILL);
    },
    interrupt: function(): void{
        const ensure = ensureProcess.bind(this);
        ensure(Priority.Always, '/bin/profiled');
        _.each(_.keys(Game.spawns), (spawn) => {
            ensure(Priority.Always, '/bin/spawnd', [spawn]);
        });
    },
    kill: function(): never{
        throw Error('PID 0 should never be killed!');
    }
};
