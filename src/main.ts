import {FS} from './kernel/fs';
import * as Kernel from './kernel/kernel';
import { default as  memory } from './kernel/memory';
import * as mkfs from './mkfs';
import './plugins/LoAN.inject';

memory.load();
global.Kernel = Kernel;
global.FS = FS;
global.memory = memory;
mkfs.init();

export function loop(){
    memory.ensure();
    Kernel.loadProcessTable();
    Kernel.schedule();
    Kernel.run();
    Kernel.saveProcessTable();
    memory.save();
}
