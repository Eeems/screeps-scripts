interface RoomPosition {
    isNearExit(range: number): boolean;
    openAdjacentSpots(ignoreCreeps?: boolean): RoomPosition[];
    getPositionAtDirection(direction: number, range?: number): RoomPosition;
    isPassible(ignoreCreeps?: boolean): boolean;
    lookForStructure(structureType: string): Structure;
    getRangeToClosest(positions:{pos: RoomPosition}[] | RoomPosition[]): number;
    terrainCost(): number;
}

interface Creep {
    travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
}

interface Room {
    structures: Structure[],
    findStructures<T extends Structure>(structureType: string): T[],
    lairThreats: StructureKeeperLair[]
}
