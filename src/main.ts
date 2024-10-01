import Engine from "./Engine.js";

export async function mainH5() {
    new EventSource('/esbuild').addEventListener('change', (e) => {
        window.location.reload();
    });
}
export async function mainMinigame() {
    await new Promise(resolve => {
        document.addEventListener("load", resolve);
    })
}
export async function start() {
    const engine = new Engine();
    // device.onmessage = function(data) {
    //     engine.onMessage(data);
    // }
    // device.createWorker("dist/worker/main.js");
    // engine.sendMessage = device.sendmessage;
    await engine.load();
}

