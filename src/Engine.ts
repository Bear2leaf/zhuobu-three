
import * as THREE from 'three';
import Device from './device/Device.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { MainMessage, WorkerMessage } from './worker/ammo.worker.js';
export default class Engine {
    private readonly scene: THREE.Scene;
    sendMessage?: (message: MainMessage) => void;
    constructor(device: Device) {
        const width = window.innerWidth, height = window.innerHeight;

        // init

        const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
        camera.position.z = 10;
        const scene = this.scene = new THREE.Scene();

        const geometry = new THREE.SphereGeometry();
        const material = new THREE.MeshNormalMaterial();
        const light = new THREE.DirectionalLight();
        light.position.set(1, 2, 3)
        scene.add(light);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "Ball";
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: device.getCanvasGL() });
        renderer.setSize(width, height);

        // animation

        const animate = (time: number) => {

            renderer.render(scene, camera);

        }
        renderer.setAnimationLoop(animate);
    }
    onMessage(message: WorkerMessage) {
        if (message.type === "ready" && this.data) {
            this.sendMessage && this.sendMessage({
                type: "resetWorld",
            })
            this.sendMessage && this.sendMessage({
                type: "addBall",
                data: { transform: new THREE.Matrix4().toArray() }
            })
            this.sendMessage && this.sendMessage({
                type: "release",
            })
            for (const mesh of this.data.scene.children.filter(child => child instanceof THREE.Mesh && child.isMesh) as THREE.Mesh[]) {
                this.scene.add(mesh);
                this.sendMessage && this.sendMessage({
                    type: "addMesh",
                    data: {
                        vertices: [...mesh.geometry.attributes.position.array],
                        indices: [...mesh.geometry.index!.array],
                        name: mesh.name,
                        transform: [...mesh.position, ...mesh.quaternion, ...mesh.scale],
                        convex: false
                    }
                })
            }
            console.log(this.scene)
        } else if (message.type === "update") {
            this.scene.traverse(o => {
                const oo = message.objects.find(oo => oo[7] === o.name);
                if (oo) {
                    o.position.set(oo[0], oo[1], oo[2]);
                    o.quaternion.set(oo[3], oo[4], oo[5], oo[6]);
                }
            })
        }
    }
    private data?: GLTF;
    async load() {
        const loader = new GLTFLoader();
        this.data = await loader.loadAsync("resources/models/terrain.glb");
    }
}