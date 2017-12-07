const MEMORY_FORMAT = 'msgpack+lzstring';

enum KERNEL {
    NAME = 'Eeems\'screeps',
    VERSION = '0.0.1'
}

enum SEGMENTS {
    CONFIG = 0,
    KERNEL,
    INTERRUPT
}

enum INTERRUPT {
    TICKSTART = 0,
    TICKEND,
    DEINIT,
    SEGMENT,
    CREEP,
    VISION,
    PROCSTART,
    PROCKILL
}

enum INTERRUPT_TYPE {
    INTERRUPT = 1,
    WAKE
}

export default {
    SEGMENTS,
    INTERRUPT,
    INTERRUPT_TYPE,
    MEMORY_FORMAT,
    KERNEL
}
