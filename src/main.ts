import './plugins/';
import './prototypes/';
import {Kernel} from './kernel';
import {Log} from './log';

Kernel.setup();

export function loop(){
    Log.reset();
    Log.info('Tick: ' + Game.time);
    Log.group();
    if(Game.cpu.tickLimit < 300){
        Log.panic('CPU bucket too low. Tick skipped');
    }else{
        try{
            Kernel.init();
            Kernel.run();
            Kernel.deinit();
        }catch(e){
            const stack = e.stack || (new Error()).stack;
            Log.panic(`${e}${stack}`);
            Kernel.setup();
        }
    }
    // Resetting because we dont know if it errored part way through a group
    Log.reset();
    Log.group();
    Log.info('Statistics');
    Log.group()
    Log.info(`Bucket: ${Game.cpu.bucket}`);
    Log.info(`Usage: ${Game.cpu.getUsed()}`);
}
