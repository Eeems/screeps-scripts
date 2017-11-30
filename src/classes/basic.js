class Basic{ // eslint-disable-line no-unused-vars
    constructor(me){
        this._id = me.id || me.name;
        this._classname = this.constructor.name;
        classes.Basic._addInstance(this);
    }
    get me(){
        if(this.id){
            return Game.getObjectById(this.id) || Game.rooms[this.id];
        }else{
            this.destructor();
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
            Memory._class_instances = [];
        }
        Memory._class_instances = _.union(Memory._class_instances, [instance]);
    }
    static _removeInstance(instance){
        if(!Memory._class_instances){
            Memory._class_instances = [];
        }else{
            Memory._class_instances = _.difference(Memory._class_instances, [instance]);
        }
    }
    static cacheInstances(){
        if(!Memory._class_instances){
            Memory._class_instances = [];
        }else{
            _.each(Memory._class_instances, (instance, i) => {
                if(instance){
                    console.log(instance);
                    if(instance.destructor === undefined){
                        if(instance._classname){
                            console.log(`${instance._classname}#${instance._id}`);
                            // instance = _.defaults(new classes[instance._classname]({
                            //     id: instance._id
                            // }), instance);
                            Memory._class_instances.splice(i, 1);
                            if(instance.cache){
                                instance.cache();
                            }
                        }else{
                            classes.Basic._removeInstance(instance);
                        }
                    }else if(!instance.me){
                        instance.destructor();
                    }
                }else{
                    Memory._class_instances.splice(i, 1);
                }
            });
        }
    }
    static getMe(me){
        if(!Memory._class_instances){
            Memory._class_instances = [];
        }
        let instances = _.filter(Memory._class_instances, i => i.me === me);
        if(instances.length){
            return instances[0];
        }
        return false;
    }
    static getById(id){
        if(!Memory._class_instances){
            Memory._class_instances = [];
        }
        let instances = _.filter(Memory._class_instances, i => i.id === id);
        if(instances.length){
            return instances[0];
        }
        return false;
    }
    static removeMe(me){
        let instance = classes.Basic.getMe(me);
        if(instance){
            instance.destructor();
        }
    }
    static removeById(id){
        let instance = classes.Basic.getById(id);
        if(instance){
            instance.destructor();
        }
    }
};
