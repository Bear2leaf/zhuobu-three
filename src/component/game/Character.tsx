/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 public/models/character.glb -o src/components/Character.jsx -r public
*/

import React, { useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";

export function Character({ animation, ...props }: { animation: string, scale: number }) {
  const group = useRef(null);
  const { nodes, materials, animations } = useGLTF("/resources/models/character.glb", false) as any;
  const { actions } = useAnimations(animations, group);
  useEffect(() => {
    const action = actions[animation];
    if (!action) {
      throw new Error("action is undefined");
    }
    action.reset().fadeIn(0.24).play();
    return () => { action.fadeOut(0.24); };
  }, [animation]);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="fall_guys">
          <primitive object={nodes._rootJoint} />
          <skinnedMesh
            name="body"
            geometry={nodes.body.geometry}
            material={materials["Material.001"]}
            skeleton={nodes.body.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="eye"
            geometry={nodes.eye.geometry}
            material={materials["Material.001"]}
            skeleton={nodes.eye.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="hand-"
            geometry={nodes["hand-"].geometry}
            material={materials["Material.001"]}
            skeleton={nodes["hand-"].skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="leg"
            geometry={nodes.leg.geometry}
            material={materials["Material.001"]}
            skeleton={nodes.leg.skeleton}
            castShadow
            receiveShadow
          />
        </group>
      </group>
    </group>
  );
}
