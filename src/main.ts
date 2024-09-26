import Device from "./device/Device.js";

export async function mainH5() {
    const BrowserDevice = (await import("./device/BrowserDevice")).default;
    const device = new BrowserDevice();
    new EventSource('/esbuild').addEventListener('change', (e) => {
        window.location.reload();
    });
    return device;
}
export async function mainMinigame() {
    const MinigameDevice = (await import("./device/MinigameDevice")).default;
    const device = new MinigameDevice();
    await new Promise<null>(resolve => {
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
    return device;
}
export async function start(device: Device) {
    import("./Engine.js").then(m => {
        console.log(new m.default(device))
    })
}

