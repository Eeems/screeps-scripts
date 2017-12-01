class Source extends classes.Basic{ // eslint-disable-line no-unused-vars
    constructor(id){
        super(id);
        this.uncache();
    }
    get name(){
        return this.me.name;
    }
    get pos(){
        return this.me.pos;
    }
    get energy(){
        return this.me.energy;
    }
    get energyCapacity(){
        return this.me.energyCapacity;
    }
    get energyPercent(){
        return ((this.energy / this.energyCapacity) * 100).toFixed();
    }
    get room(){
        return classes.Basic.getById(this._room);
    }
    get spawn(){
        return classes.Basic.getById(this._spawn) || classes.Spawn(this._spawn);
    }
    get spaces(){
        return this._spaces;
    }
    get creeps(){
        return classes.Basic.getByIds(this._creeps);
    }
    get spawn(){
        return classes.Basic.getById(this._spawn);
    }
    get spawning(){
        if(this.spawn){
            return this.spawn
                .queue
                .filter(i => i.host === this)
                .map(i => i.role);
        }
        return [];
    }
    get requiresCreeps(){
        return this.creeps.length + this.spawning.length < this.spaces.length;
    }
    run(){
        if(this.requiresCreeps){
            this.spawn.add(roles.Harvester, this);
        }
    }
    cache(){
        if(this.me){
            if(!this._room){
                this._room = this.me.room.name;
            }
            if(!this._spawn){
                let spawns = _.sortBy(
                    this.room.spawns,
                    s => this.pos.getRangeTo(s)
                );
                if(spawns.length){
                    this._spawn = spawns[0].id;
                }
            }
            if(!this.spawn){
                this._spaces = [];
            }else if(!this._spaces.length){
                this._refreshSpaces();
            }
        }
    }
    uncache(){
        this._spaces = [];
        this._creeps = [];
    }
    _hasSpace(x, y){
        return !!this._getSpace(x, y);
    }
    _getSpace(x, y){
        return this.spaces.reduce((n, s) => n || s.x === x && s.y === y, false);
    }
    _removeSpace(x, y){
        _.remove(this._spaces, s => s.x === x && s.y === y);
    }
    _refreshSpaces(){
        let self = this;
        _.each(self.room.lookAtArea(self.pos.y - 1, self.pos.x - 1, self.pos.y + 1, self.pos.x + 1), (items, y) => {
            _.each(items, (items, x) => {
                let space = {
                    x: self.pos.x - x,
                    y: self.pos.y - y
                };
                if(_.reduce(items, (passable, item) => passable && !~OBSTACLE_OBJECT_TYPES.indexOf(item.type), true)){
                    if(self._hasSpace(space.x, space.y) || !self._getSpace(space.x, space.y).path){
                        // If the space has no obsticles check to see if there is a valid path to/from it
                        let position = self.room.getPositionAt(x, y),
                            path = {
                                to: PathFinder.search(self.spawn.pos, position),
                                from: PathFinder.search(position, self.spawn.pos)
                            };
                        if(path.to.incomplete || path.from.incomplete){
                            self._removeSpace(space.x, space.y);
                        }else{
                            space.path = path;
                            self._spaces.push(space);
                        }
                    }
                }else{
                    self._removeSpace(space.x, space.y);
                }
            });
        });
    }
};
