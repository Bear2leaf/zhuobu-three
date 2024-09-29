
import * as THREE from 'three';
import Device from './device/Device.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { MainMessage } from './worker/ammo.worker.js';
export default class Engine {
    sendMessage?: (message: MainMessage) => void;
    constructor(device: Device) {
        const width = window.innerWidth, height = window.innerHeight;

        // init

        const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
        camera.position.z = 1;

        const scene = new THREE.Scene();

        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshNormalMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        console.log(device)
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: device.getCanvasGL() });
        renderer.setSize(width, height);
        renderer.setAnimationLoop(animate);
        document.body.appendChild(renderer.domElement);

        // animation

        function animate(time: number) {

            mesh.rotation.x = time / 2000;
            mesh.rotation.y = time / 1000;

            renderer.render(scene, camera);

        }
    }
    async load() {
        const loader = new GLTFLoader();
        const data = await loader.loadAsync("resources/models/terrain.glb");
        console.log(data.scene.children)
        setTimeout(() => {

            for (const mesh of data.scene.children as THREE.Mesh[]) {
                this.sendMessage && this.sendMessage({
                    type: "addMesh",
                    data: {
                        vertices: [...mesh.geometry.attributes.position.array],
                        indices: [...mesh.geometry.index!.array],
                        name: "item" + new Date().getTime(),
                        transform: new THREE.Matrix4().identity().toArray(),
                        convex: false
                    }
                })
            }
        }, 3000);
    }
}