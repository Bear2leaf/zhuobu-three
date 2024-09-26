import React, { act, useRef, useState } from 'react'
import { useFrame, Vector3 } from '@react-three/fiber'
import { Mesh } from 'three'
import { useBearStore } from './state.js'
import { Root, Fullscreen, Container, FontFamilyProvider, Text } from '@react-three/uikit'



import { Torus } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";

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
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />

      <Physics debug>
        <RigidBody colliders={"hull"} restitution={2}>
          <Torus />
        </RigidBody>

        <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
      </Physics>
      <Root>
        <Fullscreen flexDirection="column" padding={10} gap={10}>
          <Container flexGrow={1} backgroundOpacity={0.5} hover={{ backgroundOpacity: 1 }} backgroundColor="red" />
          <Container flexGrow={1} backgroundOpacity={0.5} hover={{ backgroundOpacity: 1 }} backgroundColor="blue" />
        </Fullscreen>
        <FontFamilyProvider
          roboto={{
            bold: "resources/font/NotoSansSC-Bold.json",
          }}
        >
          <Text fontFamily="roboto" color="red" fontSize={72}>关卡</Text>
        </FontFamilyProvider>
      </Root>

    </>
  )
}

