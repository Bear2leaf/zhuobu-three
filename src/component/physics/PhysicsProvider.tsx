import React, { createContext, useEffect, useRef, useContext, useState, ReactElement } from 'react'
import { MainMessage, WorkerMessage } from '../../worker/ammo.worker.js'
import { PrimitiveProps, useFrame } from '@react-three/fiber';
import { Euler, Group, Mesh, Quaternion, Vector3, Vector3Like } from 'three';
// import @geckos.io/snapshot-interpolation
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { Snapshot } from '@geckos.io/snapshot-interpolation/lib/types.js';

// initialize the library
const SI = new SnapshotInterpolation(50)

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
    } else if (message.data.type === "updateSI") {
        SI.snapshot.add(message.data.snapshot as Snapshot);
    } else if (message.data.type === "requestLevel") {
        worker.postMessage({
            type: "release",
        });
    }
}
export const usePhysicsCharacter = () => {
    const ref = useRef<Group & { linvel?: () => Vector3, setLinvel?: (value: Vector3) => void }>(null)
    const velocity = new Vector3();
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        if (ref.current) {

            ref.current.setLinvel = (value) => {
                worker.postMessage({
                    type: "updateVelocity",
                    data: {
                        name: "Ball",
                        x: value.x,
                        y: value.y,
                        z: value.z,
                    }
                })
            }
            ref.current.linvel = () => {
                const ball = objects.find(o => o[7] === "Ball");
                if(ball) {
                    velocity.set(ball[8], ball[9], ball[10])
                }
                return velocity;
            }
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
        if (ref.current) {
            const snapshot = SI.calcInterpolation("x y z");
            if (snapshot) {
                const { state } = snapshot;
                const position = state[0] as unknown as (Vector3Like & {vx: number, vy: number, vz: number});
                ref.current.position.set(position.x, position.y, position.z);
            }
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