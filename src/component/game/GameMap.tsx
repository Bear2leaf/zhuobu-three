import React, { Suspense, useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
export function GameMap({ model, ...props }: { model: string }) {
  const { nodes, scene, animations } = useGLTF(model, false);
  const group = useRef();
  const { actions } = useAnimations(animations, group);
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
      <group scale={nodes.Plane.scale} position={nodes.Plane.position}>
        <RigidBody key={0} type="fixed" colliders="trimesh" {...props}>
          <mesh geometry={nodes.Plane.geometry} material={nodes.Plane.material} />
        </RigidBody>
      </group>
      <group scale={nodes.Grid.scale} position={nodes.Grid.position}>
        <RigidBody key={1} type="fixed" colliders="trimesh" {...props}>
          <mesh geometry={nodes.Grid.geometry} material={nodes.Grid.material} />
        </RigidBody>
      </group>
    </>
  );
};