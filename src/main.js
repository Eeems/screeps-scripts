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
classes.Basic.cacheInstances();
module.exports.loop = function(){
    profiler.wrap(function(){
        _.each(Memory.creeps, (creep, name) => {
            if(!Game.creeps[name]){
                delete Memory.creeps[name];
                classes.Creep.removeById(creep.id);
            }
        });
        _.each(_.keys(Game.rooms), name => {
            let room = classes.Room.getById(name);
            if(!room){
                console.log('Detected new room: ' + name);
                room = new classes.Room(name);
            }
            room.run();
        });
    });
};
