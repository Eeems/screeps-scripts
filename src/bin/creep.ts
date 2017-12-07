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
        const creep = Game.creeps[this.args[0]];
        if(!this.memory.room){
            this.memory.room = creep.room.name;
        }
        // const room = Game.rooms[this.memory.room.name];
    }
};
