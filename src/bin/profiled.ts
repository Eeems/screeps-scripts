import {Priority} from '../kernel/process';
import * as SYSCALL from '../kernel/syscall/';
import { default as  memory } from '../kernel/memory';
import * as Profiler from '../profiler/Profiler';

function* run(): IterableIterator<any>{
    if(!global.Profiler){
        global.Profiler = Profiler.init();
    }
    const profiler = global.Profiler;
    if(!memory.get('profiler').start){
        profiler.start();
    }
    yield new SYSCALL.Priority(Priority.Sometimes);
    profiler.output();
    return new SYSCALL.Priority(Priority.Always);
}

export default run;
