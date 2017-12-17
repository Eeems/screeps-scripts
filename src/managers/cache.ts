export class CacheManager{
    public static tick: number;
    public static structures: {[roomName: string]: {[structureType: string]: Structure[]}},
    public static friendlies: {[roomName: string]: {[structureType: string]: Creep[]}},
    public static hostiles: {[roomName: string]: {[structureType: string]: Creep[]}},

    public static setup(){
        this.init();
    }
    public static init(){
        if(Game.time !== this.tick){
            this.tick = Game.time;
            this.structures = {};
            this.friendlies = {};
            this.hostiles = {};
        }
    }
}
