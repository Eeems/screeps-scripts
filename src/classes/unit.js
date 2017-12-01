class Unit extends Basic{ // eslint-disable-line no-unused-vars
    constructor(id){
        super(id);
    }
    get name(){
        return this.me.name;
    }
    get role(){
        return roles[this.memory.role];
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
    get host(){
        return classes.Basic.getById(this.memory.host);
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
        return this.me.carry;
    }
    get carried(){
        return _.sum(this.carry);
    }
    get carryCapacity(){
        return this.me.carryCapacity;
    }
    get carryPercent(){
        return ((this.carried / this.carryCapacity) * 100).toFixed();
    }
    get isFull(){
        return this.carried === this.carryCapacity;
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
        if(!this.spawning && this.role){
            this.role.runAs(this);
        }
    }
};
