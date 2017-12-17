import {Traveler} from '../plugins/Traveler';

Creep.prototype.travelTo = function(destination: RoomPosition|{pos: RoomPosition}, options?: TravelToOptions) {
    return Traveler.travelTo(this, destination, options);
};
