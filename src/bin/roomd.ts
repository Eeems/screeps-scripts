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
        if(Game.rooms[this.args[0]]){
            if(!this.memory){
                this.memory = {};
            }
        }else{
            SYSCALL.kill(1);
        }
    },
    interrupt: function(){
        // Todo handle room
    }
};
