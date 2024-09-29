
export default interface Device {
  getCanvasGL(): HTMLCanvasElement;
  getWindowInfo(): WechatMinigame.WindowInfo;
  loadSubpackage(): Promise<null>;
  createWebAudioContext(): AudioContext;
}