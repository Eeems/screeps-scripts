class Source extends classes.Basic{ // eslint-disable-line no-unused-vars
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
    run(){
        // @todo handle checking assignments
    }
};
