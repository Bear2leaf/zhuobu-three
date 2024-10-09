import React, { useState } from "react";
import { usePhysicsRigidBody } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
export function Gameobject({ node, onRemove }: { node: Mesh, onRemove: VoidFunction }) {
    const name = node.name;
    const ref = usePhysicsRigidBody(onRemove);
    return <mesh receiveShadow castShadow={name !== "Sky"} ref={ref} name={name} geometry={node.geometry} material={node.material} position={node.position} quaternion={node.quaternion} scale={node.scale} ></mesh>
  }