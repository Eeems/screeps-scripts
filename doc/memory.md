Memory global
=============
Since Screeps doesn't properly support custom (de)serialization and expects Memory to
contain certain properties for the rest of it's code to work. We cannot compress all
of memory. Instead we have to selectivly compress memory as needed. Thus the
MemoryManager class handles this for us by allowing memory to remain uncompressed and
storing only part of it compressed via the CompressionManager.

Segments
========
Segments are powerful, but due to their nature, you can't have all of them available
in the same tick. What we can do though is temporarily store segment writes in the
compressed memory. When its segment is available and has been flushed, it will be
removed. This is possible since memory is limited to 2MB and each segment is only
100KB. We will have to be careful to manage our main memory usage, but with proper
care there will be enough room to properly handle this. It should be noted that
memory is shared by all shards, so extra care will be needed if operating on more
than one shard.

Intershard Segment
==================
The Intershard segment is tricky.
