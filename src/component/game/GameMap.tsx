import React, { Suspense, useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function GameMap({ model, ...props }: { model: string, scale: number, position: [number, number, number] }) {
  const { scene, animations } = useGLTF(model, false);
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
    <group>
      <RigidBody type="fixed" colliders="trimesh" {...props}>
          <primitive object={scene} ref={group} />
      </RigidBody>
    </group>
  );
};
