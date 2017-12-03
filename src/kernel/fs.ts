import { wrap } from '../profiler/Profiler';
import  * as _ from 'lodash';

export namespace FS {
    const _images: Array<IterableIterator<any>> = [];

    export const makeImage = wrap((image): () => IterableIterator<any> => {
            const ctor = image.constructor;
            if(~[ctor.name, ctor.displayName].indexOf('GeneratorFunction')){
                return image;
            }
            return function*(...args){
                return image(...args);
            };
        }, 'FS:makeImage'),
        setImage = wrap((name: string, image: () => IterableIterator<any>) => {
            _images[name] = image;
        }, 'FS:setImage'),
        getImage = wrap((name: string): () => IterableIterator<any> =>{
            if(!hasImage(name)){
                throw new Error(`Image ${name} not found`);
            }
            return _images[name];
        }, 'FS:getImage'),
        hasImage = wrap((name: string): boolean =>{
            return name in _images;
        }, 'FS:hasImage'),
        images = wrap((): string[] => {
            return _.keys(_images);
        }, 'FS:images');
}

export default FS;
