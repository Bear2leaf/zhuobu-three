import React, { act, useRef, useState } from 'react'

import * as THREE from 'three'
import { Experience } from './game/Experience.js';
import { useGLTF } from './loader/Gltf.js';
import { UIRoot } from './ui/UIRoot.js';
import { extend, createRoot, events } from '@react-three/fiber';

extend(THREE);
const canvas = document.createElement("canvas");
document.body.appendChild(canvas)
const root = createRoot(canvas);
// Configure the root, inject events optionally, set camera, etc
root.configure({
    events,
    camera: { position: [0, 0, 10] },
    size: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
    shadows: true
})

root.render(App())
useGLTF.setDecoderPath("/resources/draco/");
useGLTF.preload("/resources/models/game.glb", true, true);
function App() {
  return (
    <>
      <Experience></Experience>
      <UIRoot></UIRoot>
    </>
  )
}
