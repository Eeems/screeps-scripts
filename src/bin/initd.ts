import {Priority} from '../kernel/process';
import * as SYSCALL from '../kernel/syscall/';

function* ensureProcess(priority: Priority, imageName: string){
    if(!_.contains(this.children.map((process) => process.imageName), imageName)){
        const pid = yield new SYSCALL.Fork(priority, imageName);
        if(!pid){
            console.log(`Unable to launch ${imageName}`);
        }
    }
}

export default {
    next: function*(): IterableIterator<any>{
        const ensure = ensureProcess.bind(this);
        yield* ensure(Priority.Always, '/bin/profiled');
    }
};
