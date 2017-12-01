const profiler = require('ext/screeps-profiler'),
    classes = require('classes');
profiler.enable();
_.each(classes, (c) => {
    if(c !== classes.roles){
        profiler.registerClass(c, 'class.' + c.constructor.name);
    }
});
_.each(classes.roles, (r) => {
    profiler.registerClass(r, 'role.' + r.constructor.name);
});
module.exports.loop = function(){
    profiler.wrap(function(){
        classes.Basic.cacheInstances();
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
                room.cache();
            }
            room.run();
        });
    });
};
