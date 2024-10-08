import React, { createContext, useEffect, useRef, useContext, useState, ReactElement } from 'react'
import { MainMessage, WorkerMessage } from '../../worker/ammo.worker.js'
import { PrimitiveProps, useFrame } from '@react-three/fiber';
import { Euler, Group, Mesh, Quaternion, Vector3, Vector3Like } from 'three';

// initialize the library
const ballContainer = {
    group: null as unknown as Group,
    velocity: new Vector3(),
    destoryObject: null as string|null,
    onCollisionEnter: (source: string, target: string) => { console.log("Collision Enter", source, target);
        if (target === "Coin") {
            ballContainer.destoryObject = target;
        }
     },
    onCollisionExit: (source: string, target: string) => { console.log("Collision Exit", source, target) },
    onCollisionUpdate: (source: string, target: string) => { }
}
const worker = new Worker("dist/worker/main.js") as unknown as {
    onmessage: (message: { data: WorkerMessage }) => void;
    postMessage: (message: MainMessage) => void;
};
const objects: (WorkerMessage & { type: "update" })["objects"] = [];
worker.onmessage = (message) => {
    if (message.data.type === "ready") {
        worker.postMessage({
            type: "resetWorld",
        });
    } else if (message.data.type === "update") {
        objects.splice(0, objects.length);
        for (const obj of message.data.objects) {
            if (obj[7] === "Ball") {
                ballContainer.group.position.set(obj[0], obj[1], obj[2]);
                ballContainer.velocity.x = obj[8];
                ballContainer.velocity.y = obj[9];
                ballContainer.velocity.z = obj[10];
            } else {
                objects.push(obj);
            }
        }

    } else if (message.data.type === "requestLevel") {
        worker.postMessage({
            type: "release",
        });
    } else if (message.data.type === "collisionEnter") {
        ballContainer.onCollisionEnter(message.data.data[0], message.data.data[1]);
    } else if (message.data.type === "collisionExit") {
        ballContainer.onCollisionExit(message.data.data[0], message.data.data[1]);
    } else if (message.data.type === "collisionUpdate") {
        ballContainer.onCollisionUpdate(message.data.data[0], message.data.data[1]);
    }
}
export const usePhysicsCharacter = () => {
    const ref = useRef<Group & { linvel?: () => Vector3, setLinvel?: (value: Vector3) => void, destory?: boolean }>(null)
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        if (ref.current) {

            ref.current.setLinvel = (value) => {
                worker.postMessage({
                    type: "updateVelocity",
                    data: {
                        x: value.x,
                        y: value.y,
                        z: value.z,
                        name: "Ball"
                    }
                })
            }
            ref.current.linvel = () => {
                return ballContainer.velocity;
            }
            ballContainer.group = ref.current;
            worker.postMessage({
                type: "addBall",
                data: {
                    transform: ref.current.matrix.toArray()

                }
            })
        }
        return () => {
            // world.postMessage({
            //     type: "removeMesh"
            // })
        }
    }, []);

    useFrame((state, delta, frame) => {
        worker.postMessage({
            type: "tick",
            data: delta
        })
    })

    return ref
}
export const usePhysicsRigidBody = () => {
    const ref = useRef<Mesh>(null)
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        if (ref.current) {
            const position = [...ref.current.geometry.attributes.position.array];
            const indices = [...ref.current.geometry.index!.array];
            const name = ref.current.name;
            const transform = [...ref.current.position, ...ref.current.quaternion, ...ref.current.scale];
            const convex = false;
            worker.postMessage({
                type: "addMesh",
                data: {
                    vertices: position,
                    indices,
                    name,
                    transform,
                    convex
                }
            })
        }
        return () => {
            worker.postMessage({
                type: "removeMesh",
                data: ref.current?.name || ""
            })
        }
    }, []);

    useFrame(() => {
        const mesh = objects.find(o => o[7] === ref.current?.name);
        if (mesh && ref.current) {
            if (ref.current?.name === ballContainer.destoryObject) {
                ref.current.visible = false;
                worker.postMessage({
                    type: "removeMesh",
                    data: ref.current?.name || ""
                })
            }
            ref.current.position.set(mesh[0], mesh[1], mesh[2]);
            ref.current.quaternion.set(mesh[3], mesh[4], mesh[5], mesh[6]);
            
        }
    })

    return ref
}