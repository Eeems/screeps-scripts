RoomPosition.prototype.isNearExit = function(range: number): boolean {
    return this.x - range <= 0 || this.x + range >= 49 || this.y - range <= 0 || this.y + range >= 49;
};

RoomPosition.prototype.openAdjacentSpots = function (ignoreCreeps?: boolean): RoomPosition[] {
    let positions = [];
    for (let i = 1; i <= 8; i++){
        let pos = this.getPositionAtDirection(i);
        if(pos.isPassible(ignoreCreeps)){
            positions.push(pos);
        }
    }
    return positions;
};

RoomPosition.prototype.getPositionAtDirection = function(direction: number, range: number = 1): RoomPosition {
        let x = this.x,
            y = this.y,
            room = this.roomName;
        // Pay attention to where the breaks are. They are important
        switch(direction){
            case 2:
                x += range;
            case 1:
                y -= range;
                break;
            case 4:
                y += range;
            case 3:
                x += range;
                break;
            case 6:
                x -= range;
            case 5:
                y += range;
                break;
            case 8:
                y -= range;
            case 7:
                x -= range;
                break;
        }
        return new RoomPosition(x, y, room);
};

RoomPosition.prototype.isPassible = function(ignoreCreeps?: boolean): boolean {
        if(this.isNearExit(0)){
            return false;
        }
        if(_.head(this.lookFor(LOOK_TERRAIN)) !== 'wall'){
            if(
                (ignoreCreeps || this.lookFor(LOOK_CREEPS).length === 0) &&
                _.filter(this.lookFor(LOOK_STRUCTURES), (struct: Structure) => {
                    if(struct instanceof StructureRampart){
                        return !struct.my;
                    }
                    return !(
                        struct instanceof StructureRoad ||
                        struct instanceof StructureContainer
                    );
                }).length === 0
            ){
                return true;
            }
        }
        return false;
};

RoomPosition.prototype.lookForStructure = function(structureType: string): Structure{
    return _.find(
        this.lookFor(LOOK_STRUCTURES) as Structure[],
        (x) => x.structureType === structureType
    );
};

RoomPosition.prototype.getRangeToClosest = function(positions:{pos: RoomPosition}[] | RoomPosition[]): number{
    let closest = this.findClosestByRange(positions);
    if(!closest){
        return Number.MAX_VALUE;
    }
    return this.getRangeTo(closest);
};

RoomPosition.prototype.terrainCost = function(): number{
    return {
        ['swamp']: 5,
        ['plain']: 1,
        ['wall']: 0xff,
    }[Game.map.getTerrainAt(this)];
};
