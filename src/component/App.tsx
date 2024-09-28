import React, { act, useRef, useState } from 'react'
import { useFrame, Vector3 } from '@react-three/fiber'
import { Mesh } from 'three'
import { useBearStore } from '../state.js'


import { Experience } from './tps/Experience.js';

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
      <Experience></Experience>
      {/* <UIRoot></UIRoot> */}
    </>
  )
}

