import {default as Image, ImageProps} from './image';

export namespace FS {
    const _images: Array<IterableIterator<any>> = [];

    export function makeImage(image: {}): Image {
        for(let name of ImageProps){
            if(name in image){
                image[name] = makeGenerator(image[name]);
            }
        }
        return image;
    }
    export function makeGenerator(fn){
        const ctor = fn.constructor;
        if(~[ctor.name, ctor.displayName].indexOf('GeneratorFunction')){
            return fn;
        }
        return function*(...args){
            return fn.apply(this, ...args);
        };
    }
    export function setImage(name: string, image: Image){
        _images[name] = image;
    }
    export function getImage(name: string): Image{
        if(!hasImage(name)){
            throw new Error(`Image ${name} not found`);
        }
        return _images[name];
    }
    export function hasImage(name: string): boolean{
        return name in _images;
    }
    export function images(): string[]{
        return _.keys(_images);
    }
}

export default FS;
