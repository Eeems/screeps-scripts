import {FS} from './kernel/fs';
import * as Kernel from './kernel/kernel';
import { default as  memory } from './kernel/memory';
import * as mkfs from './mkfs';
import './plugins/LoAN.injecT';
import C from './kernel/constants';

global.Kernel = Kernel;
global.FS = FS;
global.C = C;
global.memory = memory;

Kernel.setup();
mkfs.setup();

export function loop(){
    Kernel.init();
    Kernel.run();
    Kernel.deinit();
}
