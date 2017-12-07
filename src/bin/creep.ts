import * as SYSCALL from '../kernel/syscall';

export default {
    setup: function(){
        if(!this.args[0]){
            SYSCALL.kill(1);
        }
    },
    next: function(){
        if(!this.memory){
            this.memory = {};
        }
        if(!this.memory.creeps){
            this.memory.creeps = [];
        }
        // const creep = Game.creeps[this.args[0]];
    }
};
