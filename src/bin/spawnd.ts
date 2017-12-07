import * as SYSCALL from '../kernel/syscall';
import C from '../kernel/constants';

export default {
    setup: function(){
        if(this.args[0]){
            SYSCALL.interrupt(C.INTERRUPT.TICKEND);
        }else{
            SYSCALL.kill(1);
        }
    },
    next: function(){
        if(Game.spawns[this.args[0]]){
            if(!this.memory){
                this.memory = {};
            }
            if(!this.memory.creeps){
                this.memory.creeps = [];
            }
        }else{
            SYSCALL.kill(1);
        }
    },
    interrupt: function(){
        /*
        const spawn = Game.spawns[this.args[0]],
            creeps = this.memory.creeps;
        if(creeps.length){
            // todo handle creeps
        }
        */
    }
};
