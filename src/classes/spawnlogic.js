class SpawnLogic extends Basic{ // eslint-disable-line no-unused-vars
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
    get room(){
        return classes.Basic.getById(this._room);
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
        return this._queue.map(i => {
            return {
                role: roles[i.role],
                host: classes.Basic.getById(i.host)
            };
        });
    }
    get uid(){
        return Math.random().toString(36).substring(7);
    }
    add(role, host){
        if(!role){
            throw new Error('Role missing');
        }
        if(!(role instanceof classes.Role)){
            throw new Error(role.constructor.name + ' is not an instance of a Role');
        }
        host = host || this;
        this._queue.push({
            host: host.id,
            role: role.name
        });
        console.log(`${host._classname}#${host.id} queued ${role.name} for spawning`);
    }
    spawn(role, host){
        let opts = role.opts(this.room.energyStructures),
            name;
        host = host || this;
        opts.memory.host = host.id;
        do{
            name = role.name + this.uid;
        }while(Game.creeps[name]);
        let res = this.logCode(this.me.spawnCreep(role.body, name, opts)) === OK;
        res && console.log(`Spawning ${role.name} for ${host.id}`);
        return res;
    }
    run(){
        if(!this.spawning && this.queue.length){
            this.queue
                .filter(item => item.role.cost <= this.room.energyAvailable)
                .forEach(item => {
                    if(!this.spawning&& this.spawn(item.role, item.host)){
                        this._queue.unshift();
                    }
                });
        }
    }
    cache(){
        if(!this._room){
            this._room = this.me.room.name;
        }
    }
};
