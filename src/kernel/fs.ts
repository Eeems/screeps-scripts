export namespace FS {
    const _paths: {[name: string]: any} = [];

    export function register(name: string, data: any): void{
        if(has(name)){
            throw new Error(`Path ${name} already exists`);
        }
        _paths[name] = data;
    }
    export function remove(name: string): void{
        if(!has(name)){
            throw new Error(`Path ${name} does not exist`);
        }
        delete _paths[name];
    }
    export function has(name: string): boolean{
        return name in _paths;
    }
    export function open(name: string): any{
        if(!has(name)){
            throw new Error(`Path ${name} not found`);
        }
        return _paths[name];
    }
    export function save(name?: string): any{
        if(name === undefined){
            _.each(_paths, save);
        }else if(!has(name)){
            throw new Error(`Path ${name} not found`);
        }else{
            const data = open(name);
            if(typeof data.save === 'function'){
                data.save();
            }
        }
    }
}

export default FS;
