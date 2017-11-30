class Creep extends classes.Basic{ // eslint-disable-line no-unused-vars
    constructor(me, role){
        super(me);
        this.role = role;
    }
    get name(){
        return this.me.name;
    }
    get body(){
        return this.me.body;
    }
    get fatigue(){
        return this.me.fatigue;
    }
    get room(){
        return this.me.room;
    }
    get saying(){
        return this.me.saying;
    }
    get ticksToLive(){
        return this.me.ticksToLive;
    }
    get spawning(){
        return this.me.spawning;
    }
    get memory(){
        return this.me.memory;
    }
    set memory(memory){
        // @todo handle setting based on memory
        this.me.memory = memory;
    }
    get carry(){
        return this.me.carry.carry;
    }
    get carryCapacity(){
        return this.me.carryCapacity;
    }
    get carryPercent(){
        return ((_.sum(this.carry) / this.carryCapacity) * 100).toFixed();
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
    run(){
        if(!this.spawning){
            this.role.run.call(this);
        }
    }
};
