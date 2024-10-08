import React, { useState } from "react";
import { usePhysicsRigidBody } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ObjectMap } from "@react-three/fiber";
import { useGLTF } from "../../misc/Gltf.js";
export function GameMap({ model, ...props }: { model: string }) {
  const { nodes, scene, animations, materials, scenes } = useGLTF(model) as unknown as GLTF & ObjectMap & {
    nodes: Record<string, Mesh>;
  };
  const [objects, setObjects] = useState<string[]>([
    "Sky",
    "Room",
    "Coin",
    "Cube",
    "Grid",
    "Suzanne",
    "Suzanne001",
    "Suzanne002",])
  const meshes = Object.keys(nodes).map((o, index) => {
    return objects.indexOf(o) !== -1 ? <GameObject key={index} node={nodes[o]} onRemove={ () => setObjects(objects.filter(obj => obj !== o)) }></GameObject> : null;
  });
  return (<>
    {meshes}
  </>
  );
};

function GameObject({ node, onRemove }: { node: Mesh, onRemove: VoidFunction }) {
  const name = node.name;
  const ref = usePhysicsRigidBody(onRemove);
  return <mesh receiveShadow castShadow={name !== "Sky"} ref={ref} name={name} geometry={node.geometry} material={node.material} position={node.position} quaternion={node.quaternion} scale={node.scale} ></mesh>
}