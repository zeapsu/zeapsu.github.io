import { useEffect, useMemo } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { AgXToneMapping, Box3, Light, Mesh, OrthographicCamera, Vector3 } from 'three'
import type { WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { WorkshopAsset } from './asset'

type DebugWindow = Window & { __workshopDebug?: { gl: WebGLRenderer; ready: boolean; setFrameloop: (mode: 'always' | 'demand' | 'never') => void } }

function Model({ asset, onReady }: { asset: WorkshopAsset; onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, asset.model)
  const scene = useMemo(() => {
    const clone = gltf.scene.clone()
    clone.traverse(object => {
      if (object instanceof Light) object.intensity *= .005
      if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true }
    })
    return clone
  }, [gltf])
  const frame = useMemo(() => {
    if (!asset.normalize) return { position: [0, 0, 0] as [number, number, number], scale: 1 }
    const bounds = new Box3().setFromObject(scene)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const scale = 6 / Math.max(size.x, size.y, size.z)
    return { position: center.multiplyScalar(-scale).toArray() as [number, number, number], scale }
  }, [scene, asset.normalize])
  useEffect(() => {
    onReady()
    const debug = (window as DebugWindow).__workshopDebug
    if (debug) debug.ready = true
  }, [onReady])
  return <group position={frame.position} scale={frame.scale}><primitive object={scene} /></group>
}

function Aim({ asset }: { asset: WorkshopAsset }) {
  const { camera, invalidate, size } = useThree()
  useEffect(() => {
    camera.lookAt(...asset.target)
    if (camera instanceof OrthographicCamera && asset.viewHeight) {
      camera.top = asset.viewHeight / 2
      camera.bottom = -asset.viewHeight / 2
      camera.right = asset.viewHeight * size.width / size.height / 2
      camera.left = -camera.right
      camera.zoom = 1
    }
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, asset, size.width, size.height])
  return null
}

export default function WorkshopCanvas({ asset, dark, onReady, onFailure }: { asset: WorkshopAsset; dark: boolean; onReady: () => void; onFailure: () => void }) {
  return <Canvas aria-hidden="true" dpr={[1, 2]} shadows="percentage" orthographic={asset.orthographic} camera={{ position: asset.camera, fov: 38, zoom: asset.zoom ?? 1 }} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} onCreated={({ gl, setFrameloop }) => {
    gl.toneMapping = AgXToneMapping
    gl.toneMappingExposure = 1.15
    if (import.meta.env.DEV) (window as DebugWindow).__workshopDebug = { gl, ready: false, setFrameloop }
    gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); if (gl.domElement.isConnected) onFailure() }, { once: true })
  }}>
    <Aim asset={asset} />
    <hemisphereLight args={[dark ? '#b7d2dd' : '#f0e6c9', '#344d64', 1.3]} />
    <directionalLight position={[3, 7, 5]} color="#ffddb0" intensity={dark ? 2 : 2.5} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={5} shadow-camera-bottom={-3} shadow-bias={-.001} />
    <directionalLight position={[-5, 4, -3]} color="#a5cdda" intensity={.8} />
    <Model asset={asset} onReady={onReady} />
  </Canvas>
}
