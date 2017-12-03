export abstract class SYSCALL{}

export class Yield extends SYSCALL{}

export class Sleep extends SYSCALL{
	public ticks: number;
	constructor(ticks: number){
		super();
		this.ticks = ticks;
	}
}

export class Fork extends SYSCALL{
	public priority: number;
	public imageName: string;
	constructor(priority: number, imageName: string){
		super();
		this.priority = priority;
		this.imageName = imageName;
	}
}

export class Inject extends SYSCALL{
	public pid: number;
	constructor(pid: number){
		super();
		this.pid = pid;
	}
}

export class Kill extends SYSCALL{
	public status: number;
	constructor(status: number){
		super();
		this.status = status;
	}
}

export class Reboot extends SYSCALL{}

export class Priority extends SYSCALL{
	public priority: number;
	constructor(priority: number){
		super();
		this.priority = priority;
	}
}
