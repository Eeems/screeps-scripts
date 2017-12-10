import * as bin from './bin/';
import * as dev from './dev/';
import {FS} from './kernel/fs';
import * as role from './role/';

export function setup(){
    _.each(bin, (image, name) => {
        FS.register(`/bin/${name}`, image);
    });
    _.each(dev, (device, name) => {
        FS.register(`/dev/${name}`, device);
    });
    _.each(role, (device, name) => {
        FS.register(`/role/${name}`, device);
    });
}
