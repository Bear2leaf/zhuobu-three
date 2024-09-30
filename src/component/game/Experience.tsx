import React, { Suspense } from "react";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { useRef } from "react";
import { CharacterController } from "./CharacterController";
import { GameMap } from "./GameMap";


export const Experience = () => {
  const shadowCameraRef = useRef(null);
  return (
    <>
      <directionalLight
        intensity={1.65}
        castShadow
        position={[0, 30, 30]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-10}
          right={10}
          top={10}
          bottom={-10}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <ambientLight intensity={0.5}></ambientLight>
        <GameMap
          model={`/resources/models/terrain.glb`}
        />
        <CharacterController />
    </>
  );
};
