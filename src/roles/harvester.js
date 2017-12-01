new classes.Role('harvester',{
    run: function(){
        if(!this.isFull){
            if(this.me.harvest(this.host.me) === ERR_NOT_IN_RANGE){
                if(this.logCode(this.me.moveByPath(this.host.spaces[0].to)) !== OK){
                    this.logCode(this.me.moveTo(this.host.me, {visualizePathStyle: {stroke: '#ffaa00'}}));
                }
            }
        }else if(this.me.transfer(this.host.spawn.me, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
            if(this.logCode(this.me.moveByPath(this.host.spaces[0].to)) !== ERR_NOT_FOUND){
                this.logCode(this.me.moveTo(this.host.spawn.me, {visualizePathStyle: {stroke: '#ffaa00'}}));
            }
        }
    }
});
