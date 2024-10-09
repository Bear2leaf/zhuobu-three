import React, { act, useRef, useState } from 'react'


import { Experience } from './game/Experience.js';
import { useGLTF } from '../misc/Gltf.js';
import { UIRoot } from './ui/UIRoot.js';

useGLTF.setDecoderPath("/resources/draco/");
useGLTF.preload("/resources/models/game.glb", true, true);
export default function App() {
  return (
    <>
      <Experience></Experience>
      <UIRoot></UIRoot>
    </>
  )
}
