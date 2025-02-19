
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
    await import("./App");
}
declare var wx: any;
const game = typeof wx !== "undefined" ? mainMinigame() : mainH5();
game.then(start);