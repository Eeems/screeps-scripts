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
        const stack = e.stack || (new Error()).stack;
        Log.panic(`${e}${stack}`);
        Kernel.setup();
    }
    Log.ungroup();
}
