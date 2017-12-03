import * as Profiler from './profiler/Profiler';
import * as Kernel from './kernel/kernel';
import { default as  memory } from './kernel/memory';

memory.load();
global.Kernel = Kernel;
global.memory = memory;

export function loop(){
    const start = Game.cpu.getUsed();
    memory.ensure();
    if(!memory.has('profiler') || !global.Profiler){
        const profiler = Profiler.init()
        if(!memory.get('profiler').start){
            profiler.start();
        }
        global.Profiler = profiler;
    }
    Kernel.loadProcessTable();
    Profiler.record('Kernel', Game.cpu.getUsed() - start);
    memory.save();
}
