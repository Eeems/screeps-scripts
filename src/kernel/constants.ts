const MEMORY_FORMAT = 'json';

enum KERNEL {
    NAME = 'Eeems\'screeps',
    VERSION = '0.0.1'
}

enum SEGMENTS {
    KERNEL = 0,
    INTERRUPT,
    DEVICES
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
    INTERRUPT,
    INTERRUPT_TYPE,
    KERNEL,
    MEMORY_FORMAT,
    SEGMENTS
}
