class Spawn extends classes.Basic{ // eslint-disable-line no-unused-vars
    constructor(id){
        super(id);
        this._queue = [];
    }
    get name(){
        return this.me.name;
    }
    get pos(){
        return this.me.pos;
    }
    get energy(){
        return this.me.energy;
    }
    get energyCapacity(){
        return this.me.energyCapacity;
    }
    get energyPercent(){
        return ((this.energy / this.energyCapacity) * 100).toFixed();
    }
    get hits(){
        return this.me.hits;
    }
    get hitsMax(){
        return this.me.hitsMax;
    }
    get hitsPercent(){
        return ((this.hits / this.hitsMax) * 100).toFixed();
    }
    get spawning(){
        return this.me.spawning;
    }
    get queue(){
        return this._queue;
    }
    add(role, host){
        if(!role){
            throw new Error('Role missing');
        }
        if(!(role.prototype instanceof classes.Role)){
            throw new Error(role.constructor.name + ' is not an instance of a role');
        }
        host = host || this;
        this._queue.push({
            host: host.id,
            role: role
        });
    }
    spawn(role, host){
        let opts = role.opts;
        host = host || this;
        opts.memory.host = host.id;
        console.log(`Spawning ${role.name} for ${host.id}`);
        return this.logCode(this.me.spawnCreep(role.body, role.name, role.opts)) === OK;
    }
    run(){
        if(!this.spawning && this.queue.length){
            let item = this.queue[0];
            if(item.role.affordable){
                this._queue.unshift();
                this.spawn(item.role, classes.Basic.getForId(item.host));
            }
        }
    }
};
