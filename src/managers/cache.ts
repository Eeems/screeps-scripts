import * as uuid from 'uuid/v1';

export class CacheManager{
    public static tick: number;
    public static structures: {[roomName: string]: {[structureType: string]: Structure[]}};
    public static friendlies: {[roomName: string]: {[structureType: string]: Creep[]}};
    public static hostiles: {[roomName: string]: {[structureType: string]: Creep[]}};
    public static fleeObjects: {[roomName: string]: RoomObject[]};
    public static lairThreats: {[roomName: string]: StructureKeeperLair[]};

    public static setup(){
        this.init();
    }
    public static init(){
        if(!global.uuid){
            global.uuid = uuid();
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
            Memory.uuids[global.uuid] = Game.time;
        }
    }
}
