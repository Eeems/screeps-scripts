const MEMORY_FORMAT = 'json';

enum SEGMENTS {
    CONFIG = 0,
    KERNEL,
    INTERRUPT,
    PROFILER
}

enum INTERRUPTS {
    TICK = 0,
    SEGMENT,
    SLEEP,
    CREEP,
    VISION
}

enum INTERRUPT_TYPE {
    INTERRUPT = 0,
    WAKE
}

export default {
    SEGMENTS,
    INTERRUPTS,
    INTERRUPT_TYPE,
    MEMORY_FORMAT
}
