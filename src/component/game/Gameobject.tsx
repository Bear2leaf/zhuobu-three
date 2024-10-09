import React, { useState } from "react";
import { usePhysicsRigidBody } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
export function Gameobject({ node }: { node: Mesh }) {
    const name = node.name;
    const ref = usePhysicsRigidBody();
    
    useFrame((state, delta) => {
      if (ref.current) {
        if (ref.current.name === "Cube" && ref.current.setPosition) {
          ref.current.position.y = Math.sin(state.clock.getElapsedTime()) * 2;
          ref.current.setPosition(ref.current.position);
        }
      }
    })
    return <mesh receiveShadow castShadow={name !== "Sky"} ref={ref} name={name} geometry={node.geometry} material={node.material} position={node.position} quaternion={node.quaternion} scale={node.scale} ></mesh>
  }