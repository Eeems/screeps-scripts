import {Log} from './log';
import * as Managers from './managers/';

export class Kernel{
    public static managers = Managers;
    public static setup(){
        if(!global.Kernel){
            global.Kernel = Kernel;
        }
        Log.setup();
        Log.info('Setup');
        Log.group();
        Managers.memory.setup();
        Managers.cache.setup();
        Log.ungroup();
    }
    public static init(){
        Log.info('Init');
        Log.group();
        Managers.memory.init();
        Managers.cache.init();
        Log.ungroup();
    }
    public static run(){
        Log.info('Run');
        Log.group();
        Log.ungroup();
    }
    public static deinit(){
        Log.info('Deinit');
        Log.group();
        Managers.memory.deinit();
        Log.ungroup();
    }
}
