import {Log} from '../log';
import * as config from '../config';
import {CacheManager as cache} from './cache';

export class StatsManager{
    public static deinit(){
        if(config.stats.enabled){
            if(!Memory.stats){
                Memory.stats = {
                    tick: Game.time
                };
            }
            Memory.stats.cpu = Game.cpu;
            Memory.stats.gcl = Game.gcl;
            Memory.stats.memory = {
                used: RawMemory.get().length
            };
            Memory.stats.market = {
                credits: Game.market.credits,
                num_orders: Game.market.orders ? _.keys(Game.market.orders).length : 0
            };
            Memory.stats.roomSummary = this.summarizeRooms();
            Log.info(`Statistics saved.`);
        }
    }
    public static summarizeRooms(): any{
        if(!cache.summarizedRooms){
            let rooms = {};
            _.each(Game.rooms, (room: Room) => {
                rooms[room.name] = this.summarizeRoomInternal(room);
            });
            cache.summarizedRooms = rooms;
        }
        return cache.summarizedRooms;
    }
    public static summarizeRoom(room: string | Room): any{
        if(typeof room === 'string'){
            room = Game.rooms[room];
        }
        if(room){
            return this.summarizeRooms()[room.name];
        }
    }
    private static summarizeRoomInternal(room: Room): any{
        if(room && room.controller && room.controller.my){
            const sources = room.find(FIND_SOURCES) as Source[],
                minerals = room.find(FIND_MINERALS) as Mineral[],
                mineral = minerals && minerals.length > 0 ? minerals[0] : null,
                extractors = room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_EXTRACTOR
                }) as StructureExtractor[],
                containers = room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                }) as StructureContainer[],
                links = room.find(FIND_MY_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_LINK
                }) as StructureLink[],
                creeps = _.filter(Game.creeps, c => c.pos.roomName == room.name && c.my),
                enemyCreeps = room.find(FIND_HOSTILE_CREEPS),
                spawns = room.find(FIND_MY_SPAWNS) as StructureSpawn[],
                towers = room.find(FIND_MY_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_TOWER
                }) as StructureTower[],
                constSites = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[],
                myConstSites = room.find(FIND_MY_CONSTRUCTION_SITES) as ConstructionSite[],
                structureTypes = _.unique(
                    room.find(FIND_STRUCTURES)
                        .map((s: Structure) => s.structureType)
                ) as string[];

            return {
                room_name: room.name,
                controller_level: room.controller.level,
                controller_progress: room.controller.progress,
                controller_needed: room.controller.progressTotal,
                controller_downgrade: room.controller.ticksToDowngrade,
                controller_blocked: room.controller.upgradeBlocked,
                controller_safemode: room.controller.safeMode || 0,
                controller_safemode_avail: room.controller.safeModeAvailable,
                controller_safemode_cooldown: room.controller.safeModeCooldown,
                energy_avail: room.energyAvailable,
                energy_cap: room.energyCapacityAvailable,
                num_sources: sources ? sources.length : 0,
                source_energy: _.sum(sources, s => s.energy),
                mineral_type: mineral ? mineral.mineralType : "",
                mineral_amount: mineral ? mineral.mineralAmount : 0,
                num_extractors: extractors ? extractors.length : 0,
                has_storage: !!room.storage,
                storage_energy: room.storage ? room.storage.store[RESOURCE_ENERGY] : 0,
                storage_minerals: room.storage ? _.sum(room.storage.store) - room.storage.store[RESOURCE_ENERGY] : 0,
                has_terminal: !!room.terminal,
                terminal_energy: room.terminal ? room.terminal.store[RESOURCE_ENERGY] : 0,
                terminal_minerals: room.terminal ? _.sum(room.terminal.store) - room.terminal.store[RESOURCE_ENERGY] : 0,
                num_containers: containers ? containers.length : 0,
                container_energy: _.sum(containers, c => c.store.energy),
                num_links: links ? links.length : 0,
                link_energy: _.sum(links, l => l.energy),
                num_creeps: creeps ? creeps.length : 0,
                creep_counts: _.countBy(creeps, c => c.memory.role),
                creep_energy: _.sum(Game.creeps, c => c.pos.roomName == room.name ? c.carry.energy : 0),
                num_enemies: enemyCreeps ? enemyCreeps.length : 0,
                num_spawns: spawns ? spawns.length : 0,
                spawns_spawning: _.sum(spawns, s => ~~s.spawning),
                num_towers: towers ? towers.length : 0,
                tower_energy: _.sum(towers, t => t.energy),
                structure_info: _.reduce(structureTypes, (info, type: string) => {
                    const structures = room.find(FIND_STRUCTURES, {
                        filter: s => s.structureType == type
                    }) as Structure[];
                    info[type] = {
                            count: structures.length,
                            min_hits: _.min(structures, 'hits').hits,
                            max_hits: _.max(structures, 'hits').hits,
                    };
                    return info;
                }, {}),
                num_construction_sites: constSites ? constSites.length : 0,
                num_my_construction_sites: myConstSites ? myConstSites.length : 0,
                ground_resources: _.reduce(room.find(FIND_DROPPED_RESOURCES), (resources: any, resource: Resource) => {
                    resources[resource.resourceType] = _.get(resources, [resource.resourceType], 0) + resource.amount;
                    return resources;
                }, {}),
                num_source_containers: this.sourceContainers(sources).length,
            };
        }
    }
    private static sourceContainers(sources: Source[]): Source[]{
        // @todo filter
        return sources;
    }
}
