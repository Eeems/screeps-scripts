function* sub(): IterableIterator<any>{
	console.log('Subprocess');
	yield;
	console.log('done sub');
	return 1;
}

function* run(): IterableIterator<any>{
	console.log('Main process');
    let res = yield* sub();
    console.log('done main');
    console.log(`result: ${res}`);
    return res;
}

export default run;
