import React, { createContext, useEffect, useRef, useContext, useState, ReactElement } from 'react'
import { MainMessage, WorkerMessage } from '../../worker/ammo.worker.js'
import { PrimitiveProps, useFrame } from '@react-three/fiber';
import { Euler, Group, Mesh, Quaternion, Vector3 } from 'three';

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
        objects.splice(0, objects.length, ...message.data.objects);
    } else if (message.data.type === "requestLevel") {
        worker.postMessage({
            type: "release",
        });
    }
}
export const usePhysicsCharacter = (props: { scale: number }) => {
    const ref = useRef<Group>(null)
    const { scale } = props;
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        if (ref.current) {

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

    useFrame(() => {
        const ball = objects.find(o => o[7] === "Ball");
        if (ball && ref.current) {
            ref.current.position.set(ball[0], ball[1], ball[2]);
            ref.current.quaternion.set(ball[3], ball[4], ball[5], ball[6]);
        }
    })

    return ref
}
export const usePhysics = () => {
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
            ref.current.position.set(mesh[0], mesh[1], mesh[2]);
            ref.current.quaternion.set(mesh[3], mesh[4], mesh[5], mesh[6]);
        }
    })

    return ref
}