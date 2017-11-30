const profiler = require('ext/screeps-profiler'),
    classes = require('classes'),
    roles = require('roles');
profiler.enable();
_.each(classes, (c) => {
    profiler.registerClass(c, 'class.' + c.constructor.name);
});
_.each(roles, (r) => {
    profiler.registerClass(r, 'role.' + r.constructor.name);
});
module.exports.loop = function(){
    profiler.wrap(function(){
        if(!Memory._class_instances){
            Memory._class_instances = {};
        }
        classes.Basic.cacheInstances();
        _.each(Memory.creeps, (creep, name) => {
            if(!Game.creeps[name]){
                delete Memory.creeps[name];
                classes.Creep.removeById(creep.id);
            }
        });
        _.each(_.keys(Game.rooms), room => {
            if(!classes.Room.getById(room)){
                console.log('Detected new room: ' + room);
                new classes.Room(room); // eslint-disable-line no-new
            }
        });
        // @todo do work
    });
};
