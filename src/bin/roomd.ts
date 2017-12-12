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
        room.sources.forEach((source) => source.ensureHarvesters());
        room.spawns.forEach((spawn) => spawn.spawnNext());
        if(
            room.spawns.length &&
            !room.creeps.filter((c) => c.role.name === 'builder').length &&
            !room.spawns.filter((s) => s.queue.filter((item) => item.role.name === 'builder').length).length
        ){
            room.spawns[0].add('builder', room);
        }
    }else{
        SYSCALL.kill(1);
    }
}

export default {
    run,
    setup
};
