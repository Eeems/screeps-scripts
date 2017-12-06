const MEMORY_FORMAT = 'json';

enum SEGMENTS {
    CONFIG = 0,
    KERNEL,
    INTERRUPT
}

enum INTERRUPT {
    TICK = 0,
    TICKEND,
    SEGMENT,
    CREEP,
    VISION
}

enum INTERRUPT_TYPE {
    INTERRUPT = 'interrupt',
    WAKE = 'wake'
}

export default {
    SEGMENTS,
    INTERRUPT,
    INTERRUPT_TYPE,
    MEMORY_FORMAT
}
