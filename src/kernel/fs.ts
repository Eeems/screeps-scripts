import {default as Image} from './image';

export namespace FS {
    const _images: Array<IterableIterator<any>> = [];

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
