import { wrap } from '../profiler/Profiler';

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
        }, 'FileSystem'),
        setImage = wrap((name: string, image: () => IterableIterator<any>) => {
            _images[name] = image;
        }, 'FileSystem'),
        getImage = wrap((name: string): () => IterableIterator<any> =>{
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
