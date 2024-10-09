import React, { useState } from "react";
import { usePhysicsRigidBody } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ObjectMap } from "@react-three/fiber";
import { useGLTF } from "../loader/Gltf.js";
import { Gameobject } from "./Gameobject.js";
export function GameMap({ model, objects }: { model: string, objects: string[] }) {
  const { nodes, scene, animations, materials, scenes } = useGLTF(model) as unknown as GLTF & ObjectMap & {
    nodes: Record<string, Mesh>;
  };
  const meshes = Object.keys(nodes).map((o, index) => {
    return objects.indexOf(o) !== -1 ? <Gameobject key={index} node={nodes[o]}></Gameobject> : null;
  });
  return (<>
    {meshes}
  </>
  );
};
