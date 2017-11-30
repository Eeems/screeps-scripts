class Spawn extends classes.Basic{ // eslint-disable-line no-unused-vars
    constructor(id){
        super(id);
        this._roles = [];
    }
    get name(){
        return this.me.name;
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
    get roles(){
        return this._roles;
    }
    addRole(role){
        this._roles = _.union(this._roles, role);
        return this.roles;
    }
};
