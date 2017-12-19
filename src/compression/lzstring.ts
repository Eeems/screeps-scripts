import * as lzstring from 'lz-string';

export default {
    compress: (data) => lzstring.compressToUTF16(data),
    decompress: (data) => lzstring.decompressFromUTF16(data)
};
