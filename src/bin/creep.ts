import {FS} from '../kernel/fs';
import * as SYSCALL from '../kernel/syscall';

function setup(){
    if(!this.args[0]){
        SYSCALL.kill(1);
    }
}

function run(){
    let creep = Game.creeps[this.args[0]];
    if(creep){
        creep = FS.open('/dev/creep').open(creep.id);
    }else{
        SYSCALL.kill(1);
    }
}

export default {
    run,
    setup
};
