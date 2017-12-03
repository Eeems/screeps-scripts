import * as SYSCALL from '../kernel/syscall';

function* sub(): IterableIterator<any>{
	yield new SYSCALL.Yield();
	yield new SYSCALL.Kill(0);
}

function* run(): IterableIterator<any>{
    return yield* sub();
}

export default run;
