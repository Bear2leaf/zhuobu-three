const Module = {};

const isBrowser = typeof worker === "undefined"
const config = {
    wasmBinary: null,
    locateFile: null
};
const handler = {
    onmessage: null,
    postMessage: null,
    messageQueue: []
}
if (isBrowser) {
    config.locateFile = () => "/resources/wasm/ammo.wasm.wasm";
    onmessage = (event) => handler.onmessage && handler.onmessage(event.data);
    handler.postMessage = (data) => postMessage(data);
    importScripts("/src/worker/ammo.wasm.js")
} else {
    globalThis.WebAssembly = {
        instantiate(path, imports) {
            return WXWebAssembly.instantiate("/resources/wasm/ammo.wasm.wasm", imports)
        },
        RuntimeError: Error
    }
    config.wasmBinary = new Uint8Array(0)

    worker.onMessage((event) => handler.onmessage && handler.onmessage(event));
    handler.postMessage = (data) => worker.postMessage(data);
    var Ammo = require('./ammo.wasm.js');
}
export { handler, config, Module };
export default Ammo;