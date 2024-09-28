import React, { Suspense } from "react";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useRef } from "react";
import { CharacterController } from "./CharacterController";
import { GameMap } from "./GameMap";

const maps = {
  terrain: {
    scale: 20,
    position: [-15, -5, 10] as [number, number, number],
  },
};

export const Experience = () => {
  const shadowCameraRef = useRef(null);
  const map = "terrain";

  return (
    <>
      <directionalLight
        intensity={2.65}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <Physics debug>
        <GameMap
          scale={maps[map].scale}
          position={maps[map].position}
          model={`/resources/models/${map}.glb`}
        />
        <CharacterController />
      </Physics>
    </>
  );
};
