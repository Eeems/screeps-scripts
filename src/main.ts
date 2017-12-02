import load from 'assemblyscript-loader';
declare abstract class Wasm{}

namespace Main{
    let isReady = false,
        kernel;
    if('Wasm' in global){
        load('kernel.wasm', { exports: kernel });
        kernel.ready.then(() => (isReady = true));
    }else{
        kernel = require('kernel');
        isReady = true;
    }
    export function loop(){
        if(isReady && 'main' in kernel){
            kernel.main();
        }
    }
}
