module FS {
    const images = [];
    export function setImage(name: string, image: any){
        images[name] = image;
    }
    export function getImage(name: string){
        if(name in images){
            return images[name];
        }
        throw new Error(`Image ${name} not found`);
    }
}

export default FS;
