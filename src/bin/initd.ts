import {Priority} from '../kernel/process';
import {startProcess, setInterrupt} from '../kernel/kernel';
import C from '../kernel/constants';

function ensureProcess(priority: Priority, imageName: string): void{
    if(!_.contains(this.children.map((process) => process.imageName), imageName)){
        // I'm PID 0 bitch. I can run syscalls
        if(!startProcess(imageName, priority, this.pid)){
            console.log(`Unable to launch ${imageName}`);
        }
    }
}

export default {
    setup: function(): void{
        // I'm PID 0 bitch. I can run syscalls
        setInterrupt(this, C.INTERRUPT.TICK);
    },
    interrupt: function(): void{
        const ensure = ensureProcess.bind(this);
        ensure(Priority.Always, '/bin/profiled');
    },
    kill: function(): never{
        throw Error('PID 0 should never be killed!');
    }
};
