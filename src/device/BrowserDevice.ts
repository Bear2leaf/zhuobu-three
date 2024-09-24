import Device from "./Device";
export default class BrowserDevice implements Device {
    private readonly windowInfo: WechatMinigame.WindowInfo;
    private readonly canvasGL: HTMLCanvasElement
    constructor() {
        this.canvasGL = document.createElement("canvas");
        document.body.appendChild(this.canvasGL);
        this.canvasGL.width = window.innerWidth
        this.canvasGL.height = window.innerHeight
        this.windowInfo = {
            windowWidth: this.canvasGL.width,
            windowHeight: this.canvasGL.height,
            pixelRatio: window.devicePixelRatio,
            statusBarHeight: 10,
            screenWidth: this.canvasGL.width,
            screenHeight: this.canvasGL.height,
            safeArea: {
                bottom: this.canvasGL.height - 20,
                height: this.canvasGL.height,
                left: 0,
                right: this.canvasGL.width,
                top: 20,
                width: this.canvasGL.width
            },
            screenTop: 0
        };
    }
    getCanvasGL(): HTMLCanvasElement {
        return this.canvasGL;
    }
    getWindowInfo(): WechatMinigame.WindowInfo {
        return this.windowInfo
    }
    now(): number {
        return performance.now();
    }
    async loadSubpackage() {
        return null;
    }
    createWebAudioContext(): AudioContext {
        return new AudioContext();
    }
}
