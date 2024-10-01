import React, { createContext, useEffect, useRef, useContext, useState, ReactElement } from 'react'
import { MainMessage, WorkerMessage } from '../../worker/ammo.worker.js'
import { useFrame } from '@react-three/fiber';

const worker = new Worker("dist/worker/main.js") as unknown as {
    onmessage: (message: { data: WorkerMessage }) => void;
    postMessage: (message: MainMessage) => void;
};
const objects: (WorkerMessage & {type: "update"})["objects"] = [];
worker.onmessage = (message) => {
    if (message.data.type === "ready") {
        worker.postMessage({
            type: "resetWorld",
        });
        worker.postMessage({
            type: "release",
        });
    } else if (message.data.type === "update") {
        console.log(objects.length)
        objects.splice(0, objects.length, ...message.data.objects);
    }
}
export const WorldContext = createContext(worker);
export const PhysicsProvider = ({ children }: { children: ReactElement }) => {

    const world = useContext(WorldContext);
    return (
        <WorldContext.Provider value={world}>
            {children}
        </WorldContext.Provider>
    )
}

export const usePhysics = () => {
    const ref = useRef()
    const world = useContext(WorldContext)
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        // world.postMessage({
        //     type: "addMesh",
        // })
        return () => {
            // world.postMessage({
            //     type: "removeMesh"
            // })
        }
    }, []);

    useFrame(() => {
        // console.log(objects.length)
    })

    return ref
}