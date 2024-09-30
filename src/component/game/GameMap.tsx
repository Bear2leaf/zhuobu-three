import React, { useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { usePhysics } from "../physics/PhysicsProvider.js";
export function GameMap({ model, ...props }: { model: string }) {
  const { nodes, scene, animations } = useGLTF(model, false);
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  const body = usePhysics()
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
      <primitive ref={body} object={scene}></primitive>
    </>
  );
};