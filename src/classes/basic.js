class Basic{ // eslint-disable-line no-unused-vars
    constructor(id){
        this._id = id;
        this._classname = this.constructor.name;
        classes.Basic._addInstance(this);
    }
    get me(){
        return Game.getObjectById(this.id) || Game.rooms[this.id];
    }
    get id(){
        return this._id;
    }
    destructor(){
        console.log('Removing ' + this._id);
        console.log(new Error().stack);
        delete this._id;
        classes.Basic._removeInstance(this);
    }
    static _addInstance(instance){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }
        Memory._class_instances[instance.id] = instance;
    }
    static _removeInstance(instance){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }else{
            delete Memory._class_instances[instance.id];
        }
    }
    static cacheInstance(instance, id){
        if(instance && instance._classname){
            if(!instance.destructor){
                if(!id){
                    id = instance._id;
                }
                instance = _.defaults(new classes[instance._classname](id), instance);
                instance.cache && instance.cache();
            }
            return instance;
        }
        return false;
    }
    static cacheInstances(){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }else{
            _.each(Memory._class_instances, (instance, id) => {
                instance = classes.Basic.cacheInstance(instance);
                if(!instance){
                    classes.Basic._removeInstance(id);
                }
            });
        }
    }
    static getById(id){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }
        return classes.Basic.cacheInstance(Memory._class_instances[id]);
    }
    static getByIds(ids){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }
        return ids.map(id => classes.Basic.getById(id)).filter(i => i);
    }
    static removeById(id){
        let instance = classes.Basic.getById(id);
        if(instance){
            instance.destructor();
        }
    }
    logCode(code){
        if(code !== OK){
            console.log(`${this.constructor.name}#${this.id}: ${code}`);
        }
        return code;
    }
};
