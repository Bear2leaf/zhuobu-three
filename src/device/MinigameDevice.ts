import 'minigame-api-typings';
import Device from "./Device";


export default class MinigameDevice implements Device {
    private readonly windowInfo: WechatMinigame.WindowInfo;
    private readonly canvasGL: HTMLCanvasElement
    private readonly divideTimeBy: number;
    private startupTime: number = wx.getPerformance().now();
    constructor() {
        this.canvasGL = document.createElement("canvas");
        const info = wx.getWindowInfo();
        (this.canvasGL.width) = info.windowWidth;
        (this.canvasGL.height) = info.windowHeight;
        this.windowInfo = wx.getWindowInfo()
        const isDevTool = wx.getDeviceInfo().platform === "devtools";
        this.divideTimeBy = isDevTool ? 1 : 1000;

    }
    getWindowInfo(): WechatMinigame.WindowInfo {
        return this.windowInfo
    }
    getCanvasGL(): HTMLCanvasElement {
        return this.canvasGL as unknown as HTMLCanvasElement;
    }
    now(): number {
        return (wx.getPerformance().now() - this.startupTime) / this.divideTimeBy;
    }
    async loadSubpackage() {
        return await new Promise<null>(resolve => {
            const task = wx.loadSubpackage({
                name: "resources",
                success(res: { errMsg: string }) {
                    console.debug("load resources success", res)
                    resolve(null);
                },
                fail(res: { errMsg: string }) {
                    console.error("load resources fail", res)
                },
                complete() {
                    console.debug("load resources complete");
                }
            })

            task.onProgressUpdate((res) => {
                console.debug(`onProgressUpdate: ${res.progress}, ${res.totalBytesExpectedToWrite}, ${res.totalBytesWritten}`)
            })
        });
    }
    createWebAudioContext(): AudioContext {
        return wx.createWebAudioContext() as unknown as AudioContext;
    }
}

