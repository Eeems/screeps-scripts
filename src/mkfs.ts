import * as bin from './bin/';
import {FS} from './kernel/fs';

export function init(){
    _.each(bin, (image, name)=>{
        FS.setImage(`/bin/${name}`, FS.makeImage(image));
    });
}
