import {Log} from './log';
import {cache, memory, compression, stats} from './managers/';

export class Kernel{
    public static managers = {
        cache,
        memory,
        compression,
        stats
    };
    public static setup(){
        if(!global.Kernel){
            global.Kernel = Kernel;
        }
        Log.setup();
        Log.info('Setup');
        Log.group();
        memory.setup();
        cache.setup();
        Log.ungroup();
    }
    public static init(){
        Log.info('Init');
        Log.group();
        memory.init();
        cache.init();
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
        memory.deinit();
        stats.deinit();
        Log.ungroup();
    }
}
