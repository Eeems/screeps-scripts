import C from '../kernel/constants';
import {Priority, Process} from '../kernel/process';
import * as SYSCALL from '../kernel/syscall';

function ensureProcess(priority: Priority, imageName: string, args: string[] = []): void{
    if(!_.filter(this.children, (process: Process) => imageName === process.imageName && args.join(' ') === process.args.join(' ')).length){
        console.log(`Launching ${imageName} ${args.join(' ')}`);
        if(!SYSCALL.fork(priority, imageName, args)){
            console.log(`Unable to launch ${imageName}`);
        }
    }
}

function interrupt(): void{
    const ensure = ensureProcess.bind(this);
    // ensure(Priority.Always, '/bin/profiled');
    _.each(_.keys(Game.rooms), (room) => ensure(Priority.Always, '/bin/roomd', [room]));
    _.each(_.keys(Game.creeps), (creep) => ensure(Priority.AlwaysLast, '/bin/creep', [creep]));
}

export default {
    interrupt,
    kill: (): never => {
        throw Error('PID 0 should never be killed!');
    },
    setup: (): void => {
        SYSCALL.interrupt(C.INTERRUPT.TICKSTART);
        SYSCALL.interrupt(C.INTERRUPT.PROCKILL);
    }
};
