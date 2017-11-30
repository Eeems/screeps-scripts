class Basic{ // eslint-disable-line no-unused-vars
    constructor(id){
        this._id = id;
        this._classname = this.constructor.name;
        classes.Basic._addInstance(this);
    }
    get me(){
        if(this.id){
            return Game.getObjectById(this.id) || Game.rooms[this.id];
        }
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
    static cacheInstances(){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }else{
            _.each(Memory._class_instances, (instance, id) => {
                if(!instance){
                    classes.Basic._removeInstance(id);
                }if(!instance.destructor){ // Not a class derived from classes.Basic
                    if(instance._classname){
                        instance = _.defaults(new classes[instance._classname](id), instance);
                        if(instance.cache){
                            instance.cache();
                        }
                    }else{
                        classes.Basic._removeInstance(id);
                    }
                }
            });
        }
    }
    static getById(id){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }
        return Memory._class_instances[id] || false;
    }
    static removeById(id){
        let instance = classes.Basic.getById(id);
        if(instance){
            instance.destructor();
        }
    }
};
