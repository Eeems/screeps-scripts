class Role{ // eslint-disable-line no-unused-vars
    constructor(name, opts){
        opts = _.defaultsDeep(opts, {
            memory: {
                role: name
            },
            energyStructures: [],
            body: [WORK, CARRY, MOVE],
            run: function(){}
        });
        this.name = name;
        this._memory = opts.memory;
        this._body = opts.body;
        this._run = opts.run;
        classes.roles[name] = this;
    }
    get run(){
        return this._run;
    }
    get memory(){
        return this._memory;
    }
    set memory(memory){
        // @todo update all live creeps
        this._memory = memory;
    }
    get body(){
        return this._body;
    }
    opts(energyStructures){
        let opts = {
            memory: this.memory
        };
        if(energyStructures){
            opts.energyStructures = energyStructures;
        }
        return opts;
    }
    get cost(){
        return Math.max(_.reduce(this.body, (n, part) => n + BODYPART_COST[part], 0), 300);
    }
    get renewCost(){
        return Math.ceil(this.cost / 2.5 / this.body.length);
    }
    get canSpawn(){
        return _.reduce(this.energyStructures, (n, s) => n + s.energy, 0) < this.cost;
    }
    get creeps(){
        return _.filter(Game.creeps, (creep) => creep.memory.role === this.name);
    }
    get length(){
        return this.creeps.length;
    }
    static get(name){
        return roles[name];
    }
    static exists(name){
        return !!roles[name];
    }
    runAs(unit){
        this.run.call(unit);
    }
};
// const Role = module.exports.Role;
