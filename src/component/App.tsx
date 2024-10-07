import React, { act, useRef, useState } from 'react'


import { Experience } from './game/Experience.js';
import { useGLTF } from '../misc/Gltf.js';

export default function App() {
  useGLTF.setDecoderPath("/resources/draco/")
  return (
    <>
      <Experience></Experience>
      {/* <UIRoot></UIRoot> */}
    </>
  )
}
