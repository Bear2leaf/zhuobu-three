
const context = wx.createWebAudioContext();

const tempFuncWrapper = function (name, args) {
    console.warn(`${name} with ${args} is called in weapp!`)
}


const startupTime = wx.getPerformance().now();
const { platform } = wx.getDeviceInfo()
const navigator = {
    platform,
    userAgent: "",
    getGamepads() {
        return [];
    },
}

class AudioContext {
    constructor() {
        this.destination = context.destination;
    }
    async decodeAudioData(data, resolvecb, rejectcb) {
        if (resolvecb) {
            context.decodeAudioData(data, buffer => {
                resolvecb(buffer)
            }, err => {
                console.error('decodeAudioData fail', err)
                rejectcb()
            })
        } else {
            return new Promise(((resolve, reject) => {
                context.decodeAudioData(data, buffer => {
                    resolve(buffer)
                }, err => {
                    console.error('decodeAudioData fail', err)
                    reject()
                })
            }))
        }
    }
    createGain() { return context.createGain(...arguments); }
    createBuffer() { return context.createBuffer(...arguments); }
    createBufferSource() { return context.createBufferSource(...arguments); }
}

class FontFace {
    constructor(family, source) {
        this.family = family;
        this.source = source;
    }
    load() {
        this.family = "monospace";
        console.log("document.font.load", this.family)
        return Promise.resolve(this);
    }
}

const windowInfo = wx.getWindowInfo();
const events = {}
const document = {
    ontouchstart: null,
    ontouchmove: null,
    ontouchend: null,
    documentElement: null,
    readyState: 'complete',
    visibilityState: 'visible',
    hidden: false,
    style: {},
    fonts: {
        check() {
            // tempFuncWrapper("document.font.check", [...arguments])
            return true;
        },
        add() {
        }
    },
    hasFocus() {
        return true
    },
    createElementNS(ns, tag) {
        tempFuncWrapper('HTMLElement.createElementNS', [...arguments]);
        return this.createElement(tag)
    },
    createElement(tag) {
        if (tag === 'canvas') {

            const canvas = wx.createCanvas()

            if (platform !== 'devtools') {
                canvas.parentElement = {
                    offsetWidth: windowInfo.windowWidth,
                    offsetHeight: windowInfo.windowHeight
                };
                canvas.clientHeight = windowInfo.windowHeight;
                canvas.clientWidth = windowInfo.windowWidth;
                canvas.removeEventListener = function () { tempFuncWrapper('HTMLElement.removeEventListener', [...arguments]); }
                canvas.addEventListener = function () {
                    // tempFuncWrapper('HTMLElement.addEventListener', [...arguments]);
                    document.addEventListener(...arguments);
                }
                canvas.focus = function () {
                    tempFuncWrapper('HTMLElement.focus', [...arguments]);
                }
                const getCtx = canvas.getContext;
                canvas.getContext = function () {
                    const ctx = getCtx.apply(canvas, arguments);
                    const measureText = ctx.measureText;
                    ctx.measureText = function () {
                        const res = measureText.apply(ctx, arguments);
                        res.fontBoundingBoxAscent = res.actualBoundingBoxAscent;
                        res.fontBoundingBoxDescent = res.actualBoundingBoxDescent;
                        return res;
                    }
                    return ctx;
                }
                canvas.getBoundingClientRect = function () {
                    return {
                        x: 0,
                        y: 0,
                        top: 0,
                        left: 0,
                        width: windowInfo.windowWidth,
                        height: windowInfo.windowHeight
                    }
                }
                canvas.ownerDocument = document;

                canvas.releasePointerCapture = function () {
                    document.releasePointerCapture(...arguments)
                }
                canvas.setPointerCapture = function () {
                    document.setPointerCapture(...arguments)
                }
            }

            return canvas
        } else if (tag === "div") {
            return {
                style: {
                    width: `${innerWidth}px`,
                    height: `${innerHeight}px`
                },
                setAttribute(name, value) {
                    this[name] = value
                },
                removeAttribute(name) {
                    delete this[name];
                },
                getAttribute(name) {
                    return this[name]
                }
            };
        } else if (tag === "style") {
            return { appendChild() { } }
        } else if (tag === "img") {
            const img = wx.createImage();
            // debugger
            return img;
        } else {
            throw new Error("unsupport tag: " + tag);
        }
    },
    body: {
        clientWidth: windowInfo.windowWidth,
        clientHeight: windowInfo.windowHeight,
        style: {
            cssText: ""
        },
        appendChild() {
            console.log(...arguments)
        }
    },
    addEventListener(type, listener) {
        if (!events[type]) {
            events[type] = []
        }
        events[type].push(listener)
    },

    removeEventListener(type, listener) {
        const listeners = events[type]

        if (listeners && listeners.length > 0) {
            for (let i = listeners.length; i--; i > 0) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1)
                    break
                }
            }
        }
    },

    dispatchEvent(event) {
        const listeners = events[event.type]

        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i](event)
            }
        }
    },
    releasePointerCapture() {
        // tempFuncWrapper("document.releasePointerCapture", [...arguments])
    },
    setPointerCapture() {
        // tempFuncWrapper("document.setPointerCapture", [...arguments])
    }
}
function base64ArrayBuffer(arrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}
class Blob {
    constructor([arrayBuffer]) {
        this.buffer = arrayBuffer
    }
}

function URL(url, url1) {
    return {
        href: url === "NotoSansSC.png" ? "resources/font/" + url : url
    }
}

URL.createObjectURL = function (blob) {
    if (typeof blob.buffer === "string" && blob.buffer.startsWith("/* draco decoder */")) {
        return "/resources/draco/draco_wasm_wrapper.js.bin";
    } else {
        return `data:image/jpeg;base64,${base64ArrayBuffer(blob.buffer)}`;
    }
}
URL.revokeObjectURL = function (url) {
    // return wx.revokeBufferURL(url)
}
class TextDecoder {
    decode(data) {
        // tempFuncWrapper("TextDecoder.decode", [...arguments]);
        return wx.decode({ data: new Uint8Array(data).buffer, format: 'utf-8' });
    }
}

function Image() {
    return wx.createImage();
}
function noop() { }
function pointerEventHandlerFactory(type) {
    return (event) => {
        const touches = [];
        touches.push(...event.changedTouches)
        for (const change of touches) {
            document.dispatchEvent({
                pageX: change.pageX,
                pageY: change.pageY,
                offsetX: change.offsetX,
                offsetY: change.offsetY,
                pointerId: change.identifier,
                target: document,
                type,
                pointerType: "touch"
            })
        }
    }
}
function touchEventHandlerFactory(type) {
    return (event) => {
        event.type = type;
        event.preventDefault = noop;
        event.stopPropagation = noop;
        document.dispatchEvent(event)
    }
}

function wheelEventHandlerFactory(type) {
    return (event) => {
        event.type = type;
        event.preventDefault = noop;
        event.stopPropagation = noop;
        document.dispatchEvent(event)
    }
}

wx.onTouchStart(pointerEventHandlerFactory('pointerdown'))
wx.onTouchMove(pointerEventHandlerFactory('pointermove'))
wx.onTouchEnd(pointerEventHandlerFactory('pointerup'))
wx.onTouchCancel(pointerEventHandlerFactory('pointercancel'))

class Request {
    constructor(url) {
        this.url = url;
        tempFuncWrapper("Request.constructor", [...arguments]);
    }
}

class Headers {
    constructor() {
        tempFuncWrapper("Headers.constructor", [...arguments]);
    }
}
class ResizeObserver {
    observe() {
    }
}
class ImageData {
    constructor(data, w, h) {
        if (!window.canvas2d) {
            const canvas2d = document.createElement("canvas");
            window.canvas2d = canvas2d;
            const canvas2dCtx = canvas2d.getContext("2d");
            window.canvas2dCtx = canvas2dCtx;
        }
        const imageData = window.canvas2dCtx.createImageData(w, h);
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i + 0] = data[i + 0];
            imageData.data[i + 1] = data[i + 1];
            imageData.data[i + 2] = data[i + 2];
            imageData.data[i + 3] = data[i + 3];
        }
        window.canvas2dCtx.putImageData(imageData, w, h)
        return imageData;
    }
}


class DRACOWorker {
    constructor(DracoDecoderModule) {
        let decoderConfig;
        let decoderPending;
        this.postMessage = null;
        this.onmessage = function (e) {
            const message = e.data;
            switch (message.type) {
                case 'init':
                    decoderConfig = message.decoderConfig;
                    decoderPending = new Promise(function (resolve /*, reject*/) {
                        decoderConfig.onModuleLoaded = function (draco) {
                            // Module is Promise-like. Wrap before resolving to avoid loop.
                            resolve({ draco: draco });
                        };
                        DracoDecoderModule(decoderConfig);
                    });
                    break;

                case 'decode':
                    const buffer = message.buffer;
                    const taskConfig = message.taskConfig;
                    decoderPending.then((module) => {
                        const draco = module.draco;
                        const decoder = new draco.Decoder();
                        const decoderBuffer = new draco.DecoderBuffer();
                        decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength);
                        try {
                            const geometry = decodeGeometry(draco, decoder, decoderBuffer, taskConfig);

                            const buffers = geometry.attributes.map((attr) => attr.array.buffer);

                            if (geometry.index) buffers.push(geometry.index.array.buffer);

                            this.postMessage({ type: 'decode', id: message.id, geometry }, buffers);
                        } catch (error) {
                            console.error(error);

                            this.postMessage({ type: 'error', id: message.id, error: error.message });
                        } finally {
                            draco.destroy(decoderBuffer);
                            draco.destroy(decoder);
                        }
                    });
                    break;
            }
        };

        function decodeGeometry(draco, decoder, decoderBuffer, taskConfig) {
            const attributeIDs = taskConfig.attributeIDs;
            const attributeTypes = taskConfig.attributeTypes;

            let dracoGeometry;
            let decodingStatus;

            const geometryType = decoder.GetEncodedGeometryType(decoderBuffer);

            if (geometryType === draco.TRIANGULAR_MESH) {
                dracoGeometry = new draco.Mesh();
                decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);
            } else if (geometryType === draco.POINT_CLOUD) {
                dracoGeometry = new draco.PointCloud();
                decodingStatus = decoder.DecodeBufferToPointCloud(decoderBuffer, dracoGeometry);
            } else {
                throw new Error('THREE.DRACOLoader: Unexpected geometry type.');
            }

            if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
                throw new Error('THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg());
            }

            const geometry = { index: null, attributes: [] };

            // Gather all vertex attributes.
            for (const attributeName in attributeIDs) {
                const attributeType = self[attributeTypes[attributeName]];

                let attribute;
                let attributeID;

                // A Draco file may be created with default vertex attributes, whose attribute IDs
                // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
                // a Draco file may contain a custom set of attributes, identified by known unique
                // IDs. glTF files always do the latter, and `.drc` files typically do the former.
                if (taskConfig.useUniqueIDs) {
                    attributeID = attributeIDs[attributeName];
                    attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID);
                } else {
                    attributeID = decoder.GetAttributeId(dracoGeometry, draco[attributeIDs[attributeName]]);

                    if (attributeID === -1) continue;

                    attribute = decoder.GetAttribute(dracoGeometry, attributeID);
                }

                geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute));
            }

            // Add index.
            if (geometryType === draco.TRIANGULAR_MESH) {
                geometry.index = decodeIndex(draco, decoder, dracoGeometry);
            }

            draco.destroy(dracoGeometry);

            return geometry;
        }

        function decodeIndex(draco, decoder, dracoGeometry) {
            const numFaces = dracoGeometry.num_faces();
            const numIndices = numFaces * 3;
            const byteLength = numIndices * 4;

            const ptr = draco._malloc(byteLength);
            decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
            const index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice();
            draco._free(ptr);

            return { array: index, itemSize: 1 };
        }

        function decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute) {
            const numComponents = attribute.num_components();
            const numPoints = dracoGeometry.num_points();
            const numValues = numPoints * numComponents;
            const byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
            const dataType = getDracoDataType(draco, attributeType);

            const ptr = draco._malloc(byteLength);
            decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, dataType, byteLength, ptr);
            const array = new attributeType(draco.HEAPF32.buffer, ptr, numValues).slice();
            draco._free(ptr);

            return {
                name: attributeName,
                array: array,
                itemSize: numComponents,
            };
        }

        function getDracoDataType(draco, attributeType) {
            switch (attributeType) {
                case Float32Array:
                    return draco.DT_FLOAT32;
                case Int8Array:
                    return draco.DT_INT8;
                case Int16Array:
                    return draco.DT_INT16;
                case Int32Array:
                    return draco.DT_INT32;
                case Uint8Array:
                    return draco.DT_UINT8;
                case Uint16Array:
                    return draco.DT_UINT16;
                case Uint32Array:
                    return draco.DT_UINT32;
            }
        }
    }
}


let workerNum = 0;
class Worker {
    constructor(url, options) {
        workerNum++;
        if (workerNum > 1 && url === "/resources/draco/draco_wasm_wrapper.js.bin") {
            tempFuncWrapper("Worker.constructor", [...arguments]);
            const draco = require("/resources/draco/draco_wasm_wrapper");
            const worker = this.worker = new DRACOWorker((d) => {
                draco(d)
            });
            this.postMessage = (data) => worker.onmessage({ data });
            worker.postMessage = (data) => {
                // debugger
                this.onmessage({ data })
            };
        } else if (workerNum === 1) {

            const worker = this.worker = wx.createWorker(url, options);
            worker.onProcessKilled(() => {
                console.log("woker is been killed");
            });
            worker.onMessage((message) => {
                this.onmessage({ data: message })
            })
            this.postMessage = worker.postMessage.bind(worker)
        } else {
            throw new Error("unsupport worker args")
        }
    }
}
const _window = {
    Image,
    AudioContext,
    ResizeObserver,
    ImageData,
    FontFace,
    URL,
    Request,
    TextDecoder,
    Headers,
    navigator,
    Worker,
    Blob,
    style: {
        width: windowInfo.windowWidth,
        height: windowInfo.windowHeight
    },
    localStorage: {},
    self: {
        requestAnimationFrame,
        URL,
        Uint8Array,
        Int8Array,
        Float32Array
    },
    console: {
        log: console.log,
        assert(e, t) {
            if (!e) {
                throw new Error(t)
            }
        },
        debug: console.log,
        warn: console.log,
        error: console.log
    },
    document,
    performance: {
        now() {
            return (wx.getPerformance().now() - startupTime) / (platform === "devtools" ? 1 : 1000);
        }
    },
    WebAssembly: {
        Instance: WXWebAssembly.Instance,
        instantiate(url, imports) {
            // tempFuncWrapper("WebAssembly.instantiate", [...arguments, url.byteLength]);
            if (typeof url === "string") {
                return WXWebAssembly.instantiate(url, imports)
            } else if (url.byteLength === 9520) {
                return WXWebAssembly.instantiate("/resources/wasm/meshopt.wasm", imports)
            } else if (url.byteLength === 73540) {
                return WXWebAssembly.instantiate("/resources/wasm/yoga-wasm-base64-esm.wasm", imports)
            } else if (url.byteLength === 1439831) {
                return WXWebAssembly.instantiate("/resources/wasm/rapier_wasm3d_bg.wasm", imports)
            } else if (url.byteLength === 285948) {
                return WXWebAssembly.instantiate("/resources/draco/draco_decoder.wasm", imports)
            } else {
                throw new Error("unsupport wasm size: " + url.byteLength)
            }
        },
        validate() {
            tempFuncWrapper("WebAssembly.validate", [...arguments]);
            return true;
        },
        RuntimeError: Error
    },
    location: { href: "" },
    innerWidth: windowInfo.windowWidth,
    innerHeight: windowInfo.windowHeight,
    devicePixelRatio: windowInfo.pixelRatio,
    fetch: async function (url) {

        if (typeof url === "object") {
            tempFuncWrapper("window.fetch", ...Object.keys(url).map(o => `${o}: ${url[o]}`))
            url = url.url
            if (url === "/resources/draco/draco_wasm_wrapper.js") {
                return {
                    ok: true,
                    status: 200,
                    async text() {
                        return wx.getFileSystemManager().readFileSync(url + ".bin", "utf-8")
                    }
                }
            }
        } else {
            tempFuncWrapper("window.fetch", [...arguments])
        }
        return {
            ok: true,
            status: 200,
            async json() {
                return JSON.parse(wx.getFileSystemManager().readFileSync(url, "utf-8"))
            },
            async arrayBuffer() {
                return wx.getFileSystemManager().readFileSync(url);
            },
            async text() {
                return wx.getFileSystemManager().readFileSync(url, "utf-8")
            }
        }
    }
}
const global = GameGlobal

function inject() {
    _window.addEventListener = (type, listener) => {
        _window.document.addEventListener(type, listener)
    }
    _window.removeEventListener = (type, listener) => {
        _window.document.removeEventListener(type, listener)
    }

    _window.document.documentElement = _window;

    // 开发者工具无法重定义 window
    if (platform === 'devtools') {
        for (const key in _window) {
            const descriptor = Object.getOwnPropertyDescriptor(global, key)

            if (!descriptor || descriptor.configurable === true) {
                Object.defineProperty(window, key, {
                    value: _window[key]
                })
            }
        }

        for (const key in _window.document) {
            const descriptor = Object.getOwnPropertyDescriptor(global.document, key)

            if (!descriptor || descriptor.configurable === true) {
                Object.defineProperty(global.document, key, {
                    value: _window.document[key]
                })
            }
        }
        window.parent = window
    } else {
        for (const key in _window) {
            global[key] = _window[key]
        }
        global.window = _window
        window = global
        window.top = window.parent = window
    }
}

if (!GameGlobal.__isAdapterInjected) {
    GameGlobal.__isAdapterInjected = true
    inject()
}

wx.loadSubpackage({
    name: "resources",
    success(res) {
        console.debug("load resources success", res)
        document.dispatchEvent({ type: "load" })
    },
    fail(res) {
        console.error("load resources fail", res)
    },
    complete() {
        console.debug("load resources complete");
    }
});