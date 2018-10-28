import * as config from '../config';

export class ProfileManager{
    public static setup(){
        this.init();
    }
    public static init(){
        if(config.profile.enabled){
            if(!Memory.profile){
                Memory.profile = {
                    data: {},
                    total: 0
                };
            }
            if(!Memory.profile.start){
                Memory.profile.start = Game.time;
            }
        }
    }
    public static deinit(){
        if(config.profile.enabled){
            Memory.profile.total = Game.time - Memory.profile.start;
        }
    }
    public static profile(target: object | Function, key: string | symbol, _descriptor?: TypedPropertyDescriptor<Function>): void{
        if(config.profile.enabled){
            if(key){
                this.wrap(target, key);
            }else{
                const ctor = target as any;
                if(ctor.prototype){
                    const proto = ctor.prototype,
                        className = ctor.name;
                    Reflect.ownKeys(ctor.prototype)
                        .forEach((k) => this.wrap(proto, k, className));
                }
            }
        }
    }
    public static record(memKey: string | symbol, time: number): void{
        if(!Memory.profile.data[memKey]){
            Memory.profile.data[memKey] = {
                calls: 0,
                time: 0
            };
        }
        Memory.profile.data[memKey].calls++;
        Memory.profile.data[memKey].time += time;
    }
    private static wrap(obj: object, key: PropertyKey, className?: string){
        if(key !== 'constructor'){
            const descriptor = Reflect.getOwnPropertyDescriptor(obj, key);
            if(descriptor && !descriptor.get && !descriptor.set){
                const original = descriptor.value;
                if(original && typeof original === 'function'){
                    className = className || obj.constructor ? `${obj.constructor.name}` : '';
                }
                const memKey = `${className}:${key}`,
                    savedName = `__${key}__`;
                if(!Reflect.has(obj, savedName)){
                    Reflect.set(obj, savedName, original);
                    Reflect.set(obj, key, (self: any, ...args: any[]) => {
                        if(!config.profile.enabled){
                            return original.apply(self, args);
                        }
                        const start = Game.cpu.getUsed(),
                            result = original.apply(self, args);
                        this.record(memKey, Game.cpu.getUsed() - start);
                        return result;
                    });
                }
            }
        }
    }
}

export const profile = ProfileManager.profile;
