const segmentCount = Symbol('segmentCount'),
    SEGMENTS = {
        [segmentCount]: 0
    };

function addSegment(segment){
    SEGMENTS[segment] = SEGMENTS[SEGMENTS[segmentCount]++]
}
addSegment('CONFIG');
addSegment('KERNEL');
addSegment('INTERRUPT');
addSegment('PROFILER');

export default {
    SEGMENTS
}
