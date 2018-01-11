/* tslint:disable */
// Put shims and extensions to installed modules and typings here
/// <reference path="../src/prototypes/index.d.ts" />
/// <reference path="../src/plugins/index.d.ts" />

// add objects to `global` here
declare namespace NodeJS {
    interface Global {
        log: any;
        Memory: any;
        Kernel: any;
        uuid: string;
    }
}

// shim uglify-js for webpack
declare module "uglify-js" {
    export interface MinifyOptions {}
}

interface Game {
    shard: {
        name: string;
        type: string;
        ptr: boolean;
    }
}
interface CPU {
    shardLimits: {[shard:string]: number}
}
interface RawMemory {
    interShardSegment: string;
}
