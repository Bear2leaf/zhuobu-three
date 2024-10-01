
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { MainMessage, WorkerMessage } from './worker/ammo.worker.js';
import { extend, createRoot, events } from '@react-three/fiber';
import App from './component/App.js';
export default class Engine {
    constructor() {
        extend(THREE);
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas)
        const root = createRoot(canvas);
        // Configure the root, inject events optionally, set camera, etc
        root.configure({
            events,
            camera: { position: [0, 0, 10] },
            size: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
            shadows: true
        })

        root.render(App())
    }
    sendMessage?: (message: MainMessage) => void;
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
            // for (const mesh of this.data.scene.children.filter(child => child instanceof THREE.Mesh && child.isMesh) as THREE.Mesh[]) {
            //     this.scene.add(mesh);
            //     this.sendMessage && this.sendMessage({
            //         type: "addMesh",
            //         data: {
            //             vertices: [...mesh.geometry.attributes.position.array],
            //             indices: [...mesh.geometry.index!.array],
            //             name: mesh.name,
            //             transform: [...mesh.position, ...mesh.quaternion, ...mesh.scale],
            //             convex: false
            //         }
            //     })
            // }
            // console.log(this.scene)
        } else if (message.type === "update") {
            // this.scene.traverse(o => {
            //     const oo = message.objects.find(oo => oo[7] === o.name);
            //     if (oo) {
            //         o.position.set(oo[0], oo[1], oo[2]);
            //         o.quaternion.set(oo[3], oo[4], oo[5], oo[6]);
            //     }
            // })
        }
    }
    private data?: GLTF;
    async load() {
        const loader = new GLTFLoader();
        this.data = await loader.loadAsync("resources/models/terrain.glb");
    }
}

