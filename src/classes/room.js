class Room extends classes.Basic{ // eslint-disable-line no-unused-vars
    constructor(name){
        super(name);
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
        return classes.Basic.getByIds(this._creeps);
    }
    get spawns(){
        return classes.Basic.getByIds(this._spawns);
    }
    get sources(){
        return classes.Basic.getByIds(this._sources);
    }
    get getPositionAt(){
        return this.me.getPositionAt;
    }
    get lookAtArea(){
        return this.me.lookAtArea;
    }
    cache(){
        this.cacheItem('spawn', FIND_MY_SPAWNS);
        this.cacheItem('creep', FIND_MY_CREEPS);
        this.cacheItem('source', FIND_SOURCES);
    }
    cacheItem(name, find){
        let pluralName = name + 's',
            initName = name.substr(0, 1).toUpperCase() + name.substr(1),
            propName = '_' + pluralName,
            cached = (this[pluralName] || []).map(i => i.id),
            items = this.me.find(find, i => !~cached.indexOf(i.id));
        this[propName] = _.union(this[pluralName], items.map(i => {
            let instance = classes.Basic.getById(i.id) || new classes[initName](i.id);
            instance.cache && instance.cache();
            return i.id;
        }));
    }
    uncache(){
        this._creeps = [];
        this._spawns = [];
        this._sources = [];
    }
    run(){
        this.spawns.forEach(spawn => spawn.run());
        this.sources.forEach(source => source.run());
        this.creeps.forEach(creep => creep.run());
    }
};
