import {FS} from './kernel/fs';
import * as Kernel from './kernel/kernel';
import { default as  memory } from './kernel/memory';
import './plugins/LoAN.injecT';
import './plugins/toString.link';
import C from './kernel/constants';

global.Kernel = Kernel;
global.FS = FS;
global.C = C;
global.memory = memory;

Kernel.setup();

export function loop(){
    try{
        Kernel.init();
        Kernel.run();
        Kernel.deinit();
    }catch(e){
        console.log(`PANIC: ${e}`);
        if(!e.stack){
            console.log('  Stack:\n' + (new Error()).stack);
        }
    }
}
