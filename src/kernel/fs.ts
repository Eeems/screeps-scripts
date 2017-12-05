import { wrap } from '../profiler/Profiler';
import {default as Image} from './image';

export namespace FS {
    const _images: Array<IterableIterator<any>> = [];

    export const makeImage = wrap((image: {}): Image => {
            for(let name of ['next', 'interrupt', 'wake', 'kill']){
                if(name in image){
                    image[name] = makeGenerator(image[name]);
                }
            }
            return image;
        }, 'FileSystem'),
        makeGenerator = wrap((fn) => {
            const ctor = fn.constructor;
            if(~[ctor.name, ctor.displayName].indexOf('GeneratorFunction')){
                return fn;
            }
            return function*(...args){
                return fn(...args);
            };
        }, 'FileSystem'),
        setImage = wrap((name: string, image: Image) => {
            _images[name] = image;
        }, 'FileSystem'),
        getImage = wrap((name: string): Image =>{
            if(!hasImage(name)){
                throw new Error(`Image ${name} not found`);
            }
            return _images[name];
        }, 'FileSystem'),
        hasImage = wrap((name: string): boolean =>{
            return name in _images;
        }, 'FileSystem'),
        images = wrap((): string[] => {
            return _.keys(_images);
        }, 'FileSystem');
}

export default FS;
