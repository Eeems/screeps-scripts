import * as config from '../config';

export class ProfileManager{
    public static profile(target: object, key: string | symbol): void;
    public static profile(fn: Function): void{
        if(config.profile.enabled){

        }
    }
}

export const profile = ProfileManager.profile;
