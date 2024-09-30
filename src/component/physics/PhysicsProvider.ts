import React, { createContext, useEffect, useRef, useContext, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Quaternion, Vector3 } from 'three'

const WorldContext = createContext({})


export const usePhysics = () => {
    const ref = useRef<Mesh>()
    const world = useContext(WorldContext)
    useEffect(() => {
        // Call function so the user can add shapes, positions, etc. to the body
        // world.addBody(body)
        // return () => world.remove(body)
      }, [])
    useFrame(() => {
        if (ref.current) {
            // Transport cannon physics into the referenced threejs object
            //   const { position, quaternion } = body
            //   const { x: px, y: py, z: pz } = position
            //   const { x: qx, y: qy, z: qz, w: qw } = quaternion
            //   ref.current.position.copy(new Vector3(px, py, pz))
            //   ref.current.quaternion.copy(new Quaternion(qx, qy, qz, qw))
        }
    })

    return ref
}