import React, { createContext, useEffect, useRef, useContext, useState, ReactElement, useLayoutEffect } from 'react'
import { MainMessage, PhyicsCharacterObject, PhyicsObject, WorkerMessage } from '../worker/ammo.worker.js'
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Quaternion, Vector3 } from 'three';

const worker = new Worker("dist/worker/main.js") as unknown as {
    onmessage: (message: { data: WorkerMessage }) => void;
    postMessage: (message: MainMessage) => void;
};
const context = {
    objects: [] as PhyicsObject[],
    collideObject: "",
    characterVelocity: new Vector3(),
    updateCharacter: (obj: PhyicsCharacterObject) => { },
    onCollisionEnter: (source: string, target: string) => { context.collideObject = target },
    onCollisionExit: (source: string, target: string) => { },
    onCollisionUpdate: (source: string, target: string) => { },
}
worker.onmessage = (message) => {
    if (message.data.type === "ready") {
        worker.postMessage({
            type: "resetWorld",
        });
    } else if (message.data.type === "update") {
        context.objects.splice(0, context.objects.length, ...message.data.data);
    } else if (message.data.type === "updateCharacter") {
        context.updateCharacter(message.data.data);
    } else if (message.data.type === "requestLevel") {
        worker.postMessage({
            type: "release",
        });
    } else if (message.data.type === "collisionEnter") {
        context.onCollisionEnter(message.data.data[0], message.data.data[1]);
    } else if (message.data.type === "collisionExit") {
        context.onCollisionExit(message.data.data[0], message.data.data[1]);
    } else if (message.data.type === "collisionUpdate") {
        context.onCollisionUpdate(message.data.data[0], message.data.data[1]);
    }
}
export const usePhysicsCharacter = ({ onCollide }: { onCollide: (name: string) => void }) => {
    const ref = useRef<Group & {
        linvel: () => Vector3,
        setLinvel: (value: Vector3) => void,
    }>(null!);
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        if (ref.current) {
            ref.current.name = "Ball";
            Object.assign(ref.current, {
                setLinvel: (value: Vector3) => {
                    worker.postMessage({
                        type: "updateVelocity",
                        data: {
                            x: value.x,
                            y: value.y,
                            z: value.z,
                            name: ref.current.name
                        }
                    })
                },
                linvel: () => {
                    return context.characterVelocity;
                },
            });
            context.updateCharacter = (obj) => {
                ref.current.position.set(obj[0], obj[1], obj[2]);
                ref.current.quaternion.set(obj[3], obj[4], obj[5], obj[6]);
                context.characterVelocity.set(obj[7], obj[8], obj[9]);
            }
            worker.postMessage({
                type: "addBall",
                data: {
                    transform: ref.current.matrix.toArray()

                }
            })
        }
        return () => {
            worker.postMessage({
                type: "removeMesh",
                data: "Ball"
            })
        }
    }, []);
    useFrame((state, delta) => {
        if (!phyState.ready) {
            return;
        }
        if (ref.current && context.collideObject) {
            onCollide(context.collideObject);
            context.collideObject = "";
        }
        worker.postMessage({
            type: "tick",
            data: { delta, objects: [...context.objects] }
        })
    })

    return ref
}
export const phyState = { ready: false }
export const usePhysicsRigidBody = () => {
    const ref = useRef<Mesh & { setPosition?: (value: Vector3) => void }>(null)
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        if (ref.current) {
            ref.current.setPosition = (value) => {
                const o = context.objects.find(o => o[7] === ref.current?.name);
                if (o) {
                    o[0] = value.x;
                    o[1] = value.y;
                    o[2] = value.z;
                }
            }
            const position = [...ref.current.geometry.attributes.position.array];
            const indices = [...ref.current.geometry.index!.array];
            const name = ref.current.name;
            const transform = [...ref.current.position, ...ref.current.quaternion, ...ref.current.scale];
            const convex = name === "Cube";
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
            return () => {
                const index = context.objects.findIndex(o => o[7] === name);
                worker.postMessage({
                    type: "removeMesh",
                    data: name
                })
                if (index !== -1) {
                    context.objects.splice(index, 1);
                }
            }
        }
    }, []);

    useFrame(() => {
        const mesh = context.objects.find(o => o[7] === ref.current?.name);
        if (mesh && ref.current) {
            ref.current.position.set(mesh[0], mesh[1], mesh[2]);
            ref.current.quaternion.set(mesh[3], mesh[4], mesh[5], mesh[6]);
        }
    })

    return ref
}