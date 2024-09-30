import React from "react";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, MathUtils, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { Character } from "./Character";

const normalizeAngle = (angle: number) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start: number, end: number, t: number) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = () => {
    const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = {
      WALK_SPEED: 0.8,
      RUN_SPEED: 1.6,
      ROTATION_SPEED: degToRad(0.5)
    };
  //   const rb = useRef<RapierRigidBody>(null!);
    const container = useRef<Group>(null!);
    const character = useRef<Group>(null!);

    const [animation, setAnimation] = useState("idle");

    const characterRotationTarget = useRef(0);
    const rotationTarget = useRef(0);
    const cameraTarget = useRef<Group>(null!);
    const cameraPosition = useRef<Group>(null!);
    const cameraWorldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());
    const isClicking = useRef(false);

    useEffect(() => {
      const onMouseDown = () => {
        isClicking.current = true;
      };
      const onMouseUp = () => {
        isClicking.current = false;
      };
      document.addEventListener("pointerdown", onMouseDown);
      document.addEventListener("pointerup", onMouseUp);
      return () => {
        document.removeEventListener("pointerdown", onMouseDown);
        document.removeEventListener("pointerup", onMouseUp);
      };
    }, []);

    const vel = new Vector3();
    useFrame(({ camera, pointer }) => {
        // const vel = rb.current.linvel();

        const movement = {
          x: 0,
          z: 0,
        };


        let speed = WALK_SPEED;

        if (isClicking.current) {
          if (Math.abs(pointer.x) > 0.1) {
            movement.x = -pointer.x;
          }
          movement.z = pointer.y + 0.2;
          if (Math.abs(movement.x) > 0.5 || Math.abs(movement.z) > 0.25) {
            speed = RUN_SPEED;
          }
        }


        if (movement.x !== 0) {
          rotationTarget.current += ROTATION_SPEED * movement.x;
        }

        if (movement.x !== 0 || movement.z !== 0) {
          characterRotationTarget.current = Math.atan2(movement.x, movement.z);
          vel.x =
            Math.sin(rotationTarget.current + characterRotationTarget.current) *
            speed;
          vel.z =
            Math.cos(rotationTarget.current + characterRotationTarget.current) *
            speed;
          if (speed === RUN_SPEED) {
            setAnimation("run");
          } else {
            setAnimation("walk");
          }
        } else {
          setAnimation("idle");
        }
        character.current.rotation.y = lerpAngle(
          character.current.rotation.y,
          characterRotationTarget.current,
          0.1
        );

        // rb.current.setLinvel(vel, true);

      // CAMERA
      container.current.rotation.y = MathUtils.lerp(
        container.current.rotation.y,
        rotationTarget.current,
        0.1
      );

      cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
      camera.position.lerp(cameraWorldPosition.current, 0.1);

      if (cameraTarget.current) {
        cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
        cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

        camera.lookAt(cameraLookAt.current);
      }
    });

    return (
        <group ref={container}>
          <group ref={cameraTarget} position-z={1.5} />
          <group ref={cameraPosition} position-y={4} position-z={-4} />
          <group ref={character}>
            <Character scale={0.18} position-y={-0.25} animation={animation} />
          </group>
        </group>
    );
};
