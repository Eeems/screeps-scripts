import './plugins/';
import './prototypes/';
import {Kernel} from './kernel';
import {Log} from './log';

Kernel.setup();

export function loop(){
    Log.reset();
    Log.info('Tick ' + Game.time);
    Log.group();
    try{
        Kernel.init();
        Kernel.run();
        Kernel.deinit();
    }catch(e){
        Log.panic(`${e}${e.stack ? '' : '\n' + (new Error()).stack}`);
        Kernel.setup();
    }
    Log.ungroup();
}
