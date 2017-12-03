import {FS} from './kernel/fs';
import * as Kernel from './kernel/kernel';
import { default as  memory } from './kernel/memory';
import * as mkfs from './mkfs';
import './plugins/LoAN.inject';
import * as Profiler from './profiler/Profiler';

memory.load();
global.Kernel = Kernel;
global.FS = FS;
global.memory = memory;
mkfs.init();

export function loop(){
    memory.ensure();
    if(!memory.has('profiler') || !global.Profiler){
        const profiler = Profiler.init();
        if(!memory.get('profiler').start){
            profiler.start();
        }
        global.Profiler = profiler;
    }
    Kernel.loadProcessTable();
    Kernel.schedule();
    Kernel.run();
    Kernel.saveProcessTable();
    memory.save();
    global.Profiler.output();
}
