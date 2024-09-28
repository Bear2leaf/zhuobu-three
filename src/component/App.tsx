import React, { act, useRef, useState } from 'react'
import { useFrame, Vector3 } from '@react-three/fiber'
import { Mesh } from 'three'
import { useBearStore } from '../state.js'



import { OrbitControls, PivotControls, Torus, TransformControls } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { UIRoot } from './ui/UIRoot.js';

function Box(props: { position: Vector3 }) {
  const mesh = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const store = useBearStore();

  useFrame((state, delta) => (mesh.current && (mesh.current.rotation.x += delta)));
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onPointerDown={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
export default function App() {
  return (
    <>
      <OrbitControls makeDefault></OrbitControls>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box position={[-1.2, 0, 0]} />
      <PivotControls>
        <Box position={[0, 0, 0]} />
      </PivotControls>
      <Physics debug>
        <RigidBody colliders={"hull"} restitution={2}>
          <Torus />
        </RigidBody>

        <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
      </Physics>
      {/* <UIRoot></UIRoot> */}
    </>
  )
}

