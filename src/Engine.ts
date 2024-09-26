
import * as THREE from 'three';
import Device from './device/Device.js';
import { createRoot, events, extend } from '@react-three/fiber';
import App from './component/App.js';
export default class Engine {
    constructor(device: Device) {
        extend(THREE);
        const root = createRoot(device.getCanvasGL());
        // Configure the root, inject events optionally, set camera, etc
        root.configure({ events, camera: { position: [0, 0, 10] } })

        // createRoot by design is not responsive, you have to take care of resize yourself
        // window.addEventListener('resize', () => {
        root.configure({ size: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } })
        // })
        // Trigger resize
        // window.dispatchEvent(new Event('resize'))
        root.render(App())
    }
}