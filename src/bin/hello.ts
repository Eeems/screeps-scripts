import * as SYSCALL from '../kernel/syscall/';

function* run(): IterableIterator<any>{
    console.log('Hello World!');
    return new SYSCALL.Kill(0);
}

export default run;
