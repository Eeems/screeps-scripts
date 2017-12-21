import * as Managers from '../managers/';

const cache = Managers.cache;

// Object.defineProperty(Room.prototype, 'friendlies',{
//     get: function(){
//         if(!cache.friendlies[this.name]){
//             cache.friendlies[this.name] = _.filter(
//                 this.find(FIND_MY_CREEPS) as Creep[],
//                 (x) => !CreepHelper.isCivilian(x)
//             );
//         }
//         return cache.friendlies[this.name];
//     },
//     configurable: true,
// });

// Object.defineProperty(Room.prototype, 'hostiles',{
//     get: function(){
//         if(!cache.hostiles[this.name]){
//             let hostiles = this.find(FIND_HOSTILE_CREEPS) as Creep[],
//                 filteredHostiles = [];
//             for(let hostile of hostiles){
//                 let isEnemy = core.diplomat.checkEnemy(hostile);
//                 if(isEnemy){
//                     filteredHostiles.push(hostile);
//                 }
//             }
//             cache.hostiles[this.name] = filteredHostiles;
//         }
//         return cache.hostiles[this.name];
//     },
//     configurable: true,
// })

Object.defineProperty(Room.prototype, 'structures',{
    get: function(){
        if(!cache.structures[this.name]){
            cache.structures[this.name] = _.groupBy(
                this.find(FIND_STRUCTURES),
                (s: Structure) => s.structureType
            );
        }
        return cache.structures[this.name] || [];
    },
    configurable: true,
});

Room.prototype.findStructures = function<T extends Structure>(structureType: string): T[]{
    if(!cache.structures[this.name]){
        cache.structures[this.name] = _.groupBy(
            this.find(FIND_STRUCTURES),
            (s: Structure) => s.structureType
        );
    }
    return cache.structures[this.name][structureType] || [] as any;
};

// Object.defineProperty(Room.prototype, 'fleeObjects',{
//     get: function(){
//         if(!cache.fleeObjects[this.name]){
//             let fleeObjects = _.filter(this.hostiles, (c: Creep): boolean =>{
//                 if(c instanceof Creep){
//                     return _.find(c.body, (part: BodyPartDefinition) =>{
//                             return part.type === ATTACK || part.type === RANGED_ATTACK;
//                         }) !== null;
//                 }else{
//                     return true;
//                 }
//             });
//             if(WorldMap.roomType(this.name) === ROOMTYPE_SOURCEKEEPER){
//                 fleeObjects = fleeObjects.concat(this.lairThreats);
//             }
//             cache.fleeObjects[this.name] = fleeObjects;
//         }
//         return cache.fleeObjects[this.name];
//     },
//     configurable: true,
// });

Object.defineProperty(Room.prototype, 'lairThreats',{
    get: function(){
        if(!cache.lairThreats[this.name]){
            cache.lairThreats[this.name] = _.filter(
                this.findStructures(STRUCTURE_KEEPER_LAIR),
                (lair: StructureKeeperLair) => !lair.ticksToSpawn || lair.ticksToSpawn < 10
            );
        }
        return cache.lairThreats[this.name];
    },
    configurable: true,
});
