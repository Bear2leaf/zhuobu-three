
export default interface Device {
  getCanvasGL(): HTMLCanvasElement;
  getWindowInfo(): WechatMinigame.WindowInfo;
  now(): number;
  loadSubpackage(): Promise<null>;
  createWebAudioContext(): AudioContext;
}