import * as Uuid from 'uuid/v1';

export class CacheManager{
    public static tick: number;
    public static structures: {[roomName: string]: {[structureType: string]: Structure[]}};
    public static friendlies: {[roomName: string]: {[structureType: string]: Creep[]}};
    public static hostiles: {[roomName: string]: {[structureType: string]: Creep[]}};
    public static fleeObjects: {[roomName: string]: RoomObject[]};
    public static lairThreats: {[roomName: string]: StructureKeeperLair[]};
    public static summarizedRooms: any;

    public static setup(){
        this.init();
    }
    public static init(){
        if(!global.uuid){
            global.uuid = Uuid();
            if(!Memory.uuids){
                Memory.uuids = {};
            }
        }
        if(Game.time !== this.tick){
            this.tick = Game.time;
            this.structures = {};
            this.friendlies = {};
            this.hostiles = {};
            this.fleeObjects = {};
            this.lairThreats = {};
            this.summarizedRooms = null;
            if(!Memory.uuids[global.uuid]){
                Memory.uuids[global.uuid] = {
                    first: Game.time,
                    ticks: 0
                };
            }
            Memory.uuids[global.uuid].ticks++;
            Memory.uuids[global.uuid].last = Game.time;
            this.clean();
        }
    }
    public static clean(){
        for(const uuid of _.keys(Memory.uuids)){
            if(Game.time - Memory.uuids[uuid].last > 120){
                delete Memory.uuids[uuid];
            }
        }
    }
}
