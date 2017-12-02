import * as Profiler from './profiler/Profiler';
import * as Kernel from './kernel/kernel';

global.Profiler = Profiler.init();
// if(!Memory.profiler.start){
//     global.Profiler.start();
// }
global.Kernel = Kernel;

export function loop(){
    Kernel.loadProcessTable()
    // global.Profiler.output();
}
