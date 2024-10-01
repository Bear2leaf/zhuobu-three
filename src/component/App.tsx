import React, { act, useRef, useState } from 'react'


import { Experience } from './game/Experience.js';
import { OrbitControls } from '@react-three/drei';
import Engine from '../Engine.js';
import { PhysicsProvider } from './physics/PhysicsProvider.js';
export default function App(engine: Engine) {
  return (
    <>
      <PhysicsProvider >
        <Experience></Experience>
      </PhysicsProvider>

      {/* <UIRoot></UIRoot> */}
    </>
  )
}

