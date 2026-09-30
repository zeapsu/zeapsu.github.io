import { useEffect, useMemo } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { WorkshopAsset } from './asset'

function Model({ asset, onReady }: { asset: WorkshopAsset; onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, asset.model)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  const frame = useMemo(() => {
    if (!asset.normalize) return { position: [0, 0, 0] as [number, number, number], scale: 1 }
    const bounds = new Box3().setFromObject(scene)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const scale = 6 / Math.max(size.x, size.y, size.z)
    return { position: center.multiplyScalar(-scale).toArray() as [number, number, number], scale }
  }, [scene, asset.normalize])
  useEffect(onReady, [onReady])
  return <group position={frame.position} scale={frame.scale}><primitive object={scene} /></group>
}

function Aim({ target }: { target: WorkshopAsset['target'] }) {
  const { camera, invalidate } = useThree()
  useEffect(() => { camera.lookAt(...target); camera.updateProjectionMatrix(); invalidate() }, [camera, invalidate, target])
  return null
}

export default function WorkshopCanvas({ asset, dark, onReady, onFailure }: { asset: WorkshopAsset; dark: boolean; onReady: () => void; onFailure: () => void }) {
  return <Canvas aria-hidden="true" dpr={[1, 2]} orthographic={asset.orthographic} camera={{ position: asset.camera, fov: 38, zoom: asset.zoom ?? 1 }} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); onFailure() }, { once: true }) }}>
    <Aim target={asset.target} />
    <hemisphereLight args={[dark ? '#c8d7dd' : '#f0e6c9', '#536873', 1.5]} />
    <directionalLight position={[3, 6, 4]} color="#ffddb0" intensity={dark ? 2 : 2.5} />
    <directionalLight position={[-5, 3, -2]} color="#a5cdda" intensity={1.1} />
    <Model asset={asset} onReady={onReady} />
  </Canvas>
}
