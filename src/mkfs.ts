import * as bin from './bin/';
import {FS} from './kernel/fs';

export function setup(){
    _.each(bin, (image, name)=>{
        FS.setImage(`/bin/${name}`, image);
    });
}
