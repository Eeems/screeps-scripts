class Room extends classes.Basic{ // eslint-disable-line no-unused-vars
    constructor(me){
        super(me);
        this.uncache();
    }
    get name(){
        return this._id;
    }
    get visual(){
        let visual = this.me.visual;
        if(visual === undefined){
            visual = new RoomVisual(this.name);
        }
        return visual;
    }
    get controller(){
        return this.me.controller;
    }
    get memory(){
        return this.me.memory;
    }
    set memory(memory){
        // @todo handle updating based on memory
        this.me.memory = memory;
    }
    get storage(){
        return this.me.storage;
    }
    get terminal(){
        return this.me.terminal;
    }
    get energyAvailable(){
        return this.me.energyAvailable;
    }
    get energyCapacityAvailable(){
        return this.me.energyCapacityAvailable;
    }
    get energyPercent(){
        return ((this.energyAvailable / this.energyCapacityAvailable) * 100).toFixed();
    }
    get creeps(){
        return this._creeps;
    }
    get spawns(){
        return this._spawns;
    }
    get sources(){
        return this._sources;
    }
    cache(){
        this.cacheItem('spawn');
        this.cacheItem('creep');
        this.cacheItem('source');
    }
    cacheItem(name){
        if(this.me){
            let pluralName = name + 's',
                initName = name.substr(0, 1).toUpperCase() + name.substr(1),
                cached = _.map(this[pluralName], i => i.me),
                items = this.me.find(FIND_MY_SPAWNS, i => !~cached.indexOf(i));
            this['_' + pluralName] = _.union(this[pluralName], _.map(items, i => new classes[initName](i)));
        }
    }
    uncache(){
        this._creeps = [];
        this._spawns = [];
        this._sources = [];
    }
};
