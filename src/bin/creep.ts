import {FS} from '../kernel/fs';
import * as SYSCALL from '../kernel/syscall';

function setup(){
    const creep = Game.creeps[this.args[0]];
    if(creep){
        FS.open('/dev/creep').open(creep.id).setup();
    }else{
        SYSCALL.kill(1);
    }
}

function run(){
    const creep = Game.creeps[this.args[0]];
    if(creep){
        FS.open('/dev/creep').open(creep.id).run();
    }else{
        SYSCALL.kill(1);
    }
}

function interrupt(interrupt: number, interrupt_type: number, signal?: any){
    const creep = Game.creeps[this.args[0]];
    if(creep){
        FS.open('/dev/creep').open(creep.id).interrupt();
    }else{
        SYSCALL.kill(1);
    }
}
function wake(interrupt: number, interrupt_type: number){
    const creep = Game.creeps[this.args[0]];
    if(creep){
        FS.open('/dev/creep').open(creep.id).wake();
    }else{
        SYSCALL.kill(1);
    }
}
function kill(e?: any){
    const creep = Game.creeps[this.args[0]],
        device = FS.open('/dev/creep');
    if(creep){
        device.open(creep.id).kill();
        device.remove(creep.id);
    }
}

export default {
    interrupt,
    kill,
    run,
    setup,
    wake
};
