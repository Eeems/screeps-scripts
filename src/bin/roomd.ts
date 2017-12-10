import {FS} from '../kernel/fs';
import * as SYSCALL from '../kernel/syscall';

function setup(){
    if(!this.args[0]){
        SYSCALL.kill(1);
    }
}

function run(){
    const room = FS.open('/dev/room').open(this.args[0]);
    if(room){
        // room.sources.forEach((source) => );
        room.spawns.forEach((spawn) => spawn.spawnNext());
    }else{
        SYSCALL.kill(1);
    }
}

export default {
    run,
    setup
};
