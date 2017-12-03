import { wrap } from '../profiler/Profiler';

export const memcmp = wrap((vl: number, vr: number, n: number): number => {
        vl;vr;n;
        return 0;
    }, 'ram:memcmp'),
    memcpy = wrap((dest: number, src: number, n: number): number => {
        dest;src;n;
        return 0;
    }, 'ram:memcpy'),
    memset = wrap((dest: number, c: number, n: number): number => {
        dest;c;n;
        return 0;
    }, 'ram:memset'),
    malloc = wrap((size: number): number => {
        size;
        return 0;
    }, 'ram:malloc'),
    realloc = wrap((ptr: number, size: number): number => {
        ptr;size;
        return 0;
    }, 'ram:realloc'),
    free = wrap((ptr: number): void => {
        ptr;
    }, 'ram:free');
