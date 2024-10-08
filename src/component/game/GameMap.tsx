import React, { useEffect, useRef } from "react";
import { useAnimations } from "@react-three/drei";
import { usePhysicsRigidBody } from "../physics/PhysicsProvider.js";
import { Mesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ObjectMap } from "@react-three/fiber";
import { useGLTF } from "../../misc/Gltf.js";
export function GameMap({ model, ...props }: { model: string }) {
  const { nodes, scene, animations } = useGLTF(model) as unknown as GLTF & ObjectMap & {
    nodes: Record<string, Mesh>;
  };
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  const cube = usePhysicsRigidBody();
  const grid = usePhysicsRigidBody();
  const suzanne = usePhysicsRigidBody();
  const suzanne001 = usePhysicsRigidBody();
  const suzanne002 = usePhysicsRigidBody();
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  // useEffect(() => {
  //   if (actions && animations.length > 0) {
  //     actions[animations[0].name]!.play();
  //   }
  // }, [actions]);
  return (
    <>
      <mesh receiveShadow castShadow ref={cube} name={nodes.Cube.name} geometry={nodes.Cube.geometry} material={nodes.Cube.material} position={nodes.Cube.position} quaternion={nodes.Cube.quaternion} scale={nodes.Cube.scale} ></mesh>
      <mesh receiveShadow castShadow ref={grid} name={nodes.Grid.name} geometry={nodes.Grid.geometry} material={nodes.Grid.material} position={nodes.Grid.position} quaternion={nodes.Grid.quaternion} scale={nodes.Grid.scale} ></mesh>
      <mesh receiveShadow castShadow ref={suzanne} name={nodes.Suzanne.name} geometry={nodes.Suzanne.geometry} material={nodes.Suzanne.material} position={nodes.Suzanne.position} quaternion={nodes.Suzanne.quaternion} scale={nodes.Suzanne.scale} ></mesh>
      <mesh receiveShadow castShadow ref={suzanne001} name={nodes.Suzanne001.name} geometry={nodes.Suzanne001.geometry} material={nodes.Suzanne001.material} position={nodes.Suzanne001.position} quaternion={nodes.Suzanne001.quaternion} scale={nodes.Suzanne001.scale} ></mesh>
      <mesh receiveShadow castShadow ref={suzanne002} name={nodes.Suzanne002.name} geometry={nodes.Suzanne002.geometry} material={nodes.Suzanne002.material} position={nodes.Suzanne002.position} quaternion={nodes.Suzanne002.quaternion} scale={nodes.Suzanne002.scale} ></mesh>
    </>
  );
};