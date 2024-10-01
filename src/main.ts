
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
    import("./Engine.js").then(m => {
        new m.default();
    })
}

