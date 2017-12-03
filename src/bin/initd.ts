function* sub(): IterableIterator<any>{
	yield;
	return 1;
}

function* run(): IterableIterator<any>{
    return yield* sub();
}

export default run;
