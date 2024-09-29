import Device from "./device/Device.js";
import Engine from "./Engine.js";

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
    await device.loadSubpackage();
    return device;
}
export async function start(device: Device) {
    const engine = new Engine(device);
    device.onmessage = function(data) {
        // console.log(...arguments)
        if (data.type === "update" && data.objects.length) {
            console.log(data.objects.length)
        }
    }
    device.createWorker("dist/worker/main.js");
    engine.sendMessage = device.sendmessage;
    await engine.load();
}

