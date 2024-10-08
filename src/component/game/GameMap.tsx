import React, { useEffect, useRef } from "react";
import { useAnimations } from "@react-three/drei";
import { usePhysicsRigidBody } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ObjectMap } from "@react-three/fiber";
import { useGLTF } from "../../misc/Gltf.js";
export function GameMap({ model, ...props }: { model: string }) {
  const { nodes, scene, animations, materials, scenes } = useGLTF(model) as unknown as GLTF & ObjectMap & {
    nodes: Record<string, Mesh>;
  };
  const objects = [
    "Sky",
    "Room",
    "Coin",
    "Cube",
    "Grid",
    "Suzanne",
    "Suzanne001",
    "Suzanne002",
  ]
  const meshes = objects.map((name, index) => {
    const ref = usePhysicsRigidBody();
    console.log(ref);
    return <mesh key={index} receiveShadow castShadow={name !== "Sky"} ref={ref} name={nodes[name].name} geometry={nodes[name].geometry} material={nodes[name].material} position={nodes[name].position} quaternion={nodes[name].quaternion} scale={nodes[name].scale} ></mesh>
  });
  return (<>
    {meshes}
  </>
  );
};