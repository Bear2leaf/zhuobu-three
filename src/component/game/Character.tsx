
import React, { useEffect, useRef } from "react";
import { useAnimations } from "@react-three/drei";
import { Mesh, SkinnedMesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ObjectMap } from "@react-three/fiber";
import { useGLTF } from "../../misc/Gltf.js";

export function Character({ animation, ...props }: { animation: string, scale: number }) {
  const group = useRef(null);
  const { nodes, materials, animations } = useGLTF("/resources/models/game.glb") as unknown as GLTF & ObjectMap & {
    nodes: Record<string, SkinnedMesh>;
  };
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
    <group ref={group} {...props}>
      <group name="Scene">
        <group name="fall_guys">
          <primitive object={nodes._rootJoint} />
          <skinnedMesh
            name="body"
            geometry={nodes.body.geometry}
            material={nodes.body.material}
            skeleton={nodes.body.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="eye"
            geometry={nodes.eye.geometry}
            material={nodes.eye.material}
            skeleton={nodes.eye.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="hand-"
            geometry={nodes["hand-"].geometry}
            material={nodes["hand-"].material}
            skeleton={nodes["hand-"].skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="leg"
            geometry={nodes.leg.geometry}
            material={nodes.leg.material}
            skeleton={nodes.leg.skeleton}
            castShadow
            receiveShadow
          />
        </group>
      </group>
    </group>
  );
}
