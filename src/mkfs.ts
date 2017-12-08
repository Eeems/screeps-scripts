import * as bin from './bin/';
import * as dev from './dev/';
import {FS} from './kernel/fs';

export function setup(){
    _.each(bin, (image, name) => {
        FS.register(`/bin/${name}`, image);
    });
    _.each(dev, (device, name) => {
        FS.register(`/dev/${name}`, device);
    });
}
