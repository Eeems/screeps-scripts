import * as Profiler from './profiler/Profiler';
import {Kernel} from './kernel/kernel';

const kernel = new Kernel();
global.Profiler = Profiler.init();
// if(!Memory.profiler.start){
//     global.Profiler.start();
// }
global.Kernel = kernel;

export function loop(){
    kernel.loadProcessTable()
    // global.Profiler.output();
}
