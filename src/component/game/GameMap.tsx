import React, { useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { usePhysics } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ObjectMap } from "@react-three/fiber";
export function GameMap({ model, ...props }: { model: string }) {
  const { nodes, scene, animations } = useGLTF(model, false) as unknown as GLTF & ObjectMap & {
    nodes: Record<string, Mesh>;
  };
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  const plane = usePhysics();
  const grid = usePhysics();
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  useEffect(() => {
    if (actions && animations.length > 0) {
      actions[animations[0].name]!.play();
    }
  }, [actions]);
  return (
    <>
      <mesh receiveShadow castShadow ref={plane} name={nodes.Plane.name} geometry={nodes.Plane.geometry} material={nodes.Plane.material} position={nodes.Plane.position} quaternion={nodes.Plane.quaternion} scale={nodes.Plane.scale} ></mesh>
      <mesh receiveShadow ref={grid} name={nodes.Grid.name} geometry={nodes.Grid.geometry} material={nodes.Grid.material} position={nodes.Grid.position} quaternion={nodes.Grid.quaternion} scale={nodes.Grid.scale} ></mesh>
    </>
  );
};