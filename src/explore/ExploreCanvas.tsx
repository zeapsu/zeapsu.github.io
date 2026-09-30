import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AgXToneMapping, Vector3 } from 'three'
import type { Camera, Group, Scene, WebGLRenderer } from 'three'
import type { Selection, StationId } from './navigation'

type Vec3 = [number, number, number]
type Labels = Record<StationId, RefObject<HTMLButtonElement | null>>
type Debug = { gl: WebGLRenderer; camera: Camera; scene: Scene; ready: boolean; settled: boolean; setFrameloop: (mode: 'always' | 'demand' | 'never') => void }
type DebugWindow = Window & { __exploreDebug?: Debug }

const positions: Record<StationId, Vec3> = { research: [-2.5, 0, -.7], robotics: [2.5, 0, .5] }
const anchors: Record<StationId, Vec3> = { research: [-2.5, 2.2, -.7], robotics: [2.5, 2.35, .5] }
const poses = {
  overview: { camera: [7.8, 6.8, 11.5] as Vec3, target: [0, 1, 0] as Vec3 },
  research: { camera: [1.3, 3.7, 6.6] as Vec3, target: [-2.5, 1.05, -.7] as Vec3 },
  robotics: { camera: [6, 3.4, 6.2] as Vec3, target: [2.5, 1.2, .5] as Vec3 },
}

function Block({ at, size, color, rotation = [0, 0, 0] }: { at: Vec3; size: Vec3; color: string; rotation?: Vec3 }) {
  return <mesh position={at} rotation={rotation} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.88} /></mesh>
}

function Room({ dark }: { dark: boolean }) {
  const wall = dark ? '#2d484c' : '#acb6a5'
  return <group>
    <Block at={[0, -.16, .4]} size={[12.5, .25, 8.5]} color={dark ? '#4b443b' : '#af9270'} />
    {Array.from({ length: 13 }, (_, index) => <Block key={index} at={[-6 + index, -.025, .4]} size={[.025, .008, 8.5]} color={dark ? '#282f30' : '#7d735f'} />)}
    <Block at={[0, 2.15, -3.1]} size={[12.5, 4.5, .2]} color={wall} />
    <Block at={[0, 4.45, -3.03]} size={[12.6, .18, .32]} color="#7a5840" />
    {[-5.9, -.95, .95, 5.9].map(x => <Block key={x} at={[x, 2.15, -2.96]} size={[.14, 4.5, .32]} color="#836247" />)}
    <Block at={[0, 2.5, -2.93]} size={[1.7, 2.1, .1]} color={dark ? '#527584' : '#dce5d7'} />
    <Block at={[0, 2.5, -2.84]} size={[.075, 2.15, .09]} color="#937752" />
    <Block at={[0, 2.4, -2.84]} size={[1.8, .075, .09]} color="#937752" />
    <Block at={[0, 1.4, -2.73]} size={[2.1, .13, .48]} color="#8b6a45" />
    <Block at={[-3.7, 2.7, -2.85]} size={[2.9, .14, .55]} color="#916545" />
    {[0, 1, 2, 3, 4].map(index => <Block key={index} at={[-4.65 + index * .22, 3, -2.85]} size={[.15, .48 + (index % 2) * .16, .3]} color={['#3c665f', '#b09567', '#5b6b82'][index % 3]} rotation={[0, 0, (index - 2) * .025]} />)}
    <mesh position={[4.25, 2.7, -2.82]} castShadow><torusGeometry args={[.45, .035, 8, 48]} /><meshStandardMaterial color="#b39a64" roughness={.7} /></mesh>
    <Block at={[4.25, 2.76, -2.79]} size={[.025, .34, .025]} color="#b39a64" rotation={[0, 0, -.4]} />
  </group>
}

function Bench({ color = '#a4754d' }: { color?: string }) {
  return <group>
    <Block at={[0, 1, 0]} size={[2.65, .18, 1.5]} color={color} />
    <Block at={[0, .79, 0]} size={[2.42, .3, 1.22]} color="#76553f" />
    {[-1.06, 1.06].flatMap(x => [-.52, .52].map(z => <Block key={`${x}:${z}`} at={[x, .38, z]} size={[.15, .77, .15]} color="#73533f" />))}
    <Block at={[0, .82, .66]} size={[.64, .028, .06]} color="#c1a671" />
  </group>
}

function Station({ id, active, hover, onSelect, onHover }: { id: StationId; active: boolean; hover: boolean; onSelect: (station: Selection) => void; onHover: (station: Selection) => void }) {
  const cover = useRef<Group>(null)
  const head = useRef<Group>(null)
  const arm = useRef<Group>(null)
  const { invalidate } = useThree()
  useEffect(() => { invalidate() }, [active, hover, invalidate])
  useFrame((_, delta) => {
    const alpha = 1 - Math.exp(-Math.min(delta, .1) * 9)
    const engaged = active || hover
    const targetCover = engaged ? -.62 : -.12
    const targetHead = engaged ? -.38 : .12
    const targetArm = engaged ? -.85 : -.18
    if (cover.current) {
      cover.current.rotation.x += (targetCover - cover.current.rotation.x) * alpha
      if (Math.abs(targetCover - cover.current.rotation.x) > .002) invalidate()
    }
    if (head.current) {
      head.current.rotation.y += (targetHead - head.current.rotation.y) * alpha
      if (Math.abs(targetHead - head.current.rotation.y) > .002) invalidate()
    }
    if (arm.current) {
      arm.current.rotation.z += (targetArm - arm.current.rotation.z) * alpha
      if (Math.abs(targetArm - arm.current.rotation.z) > .002) invalidate()
    }
  })
  return <group position={positions[id]}>
    <mesh position={[0, .012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.88, 48]} /><meshStandardMaterial color={id === 'research' ? '#b5a077' : '#7f9e96'} roughness={1} /></mesh>
    <Bench color={id === 'research' ? '#b28555' : '#9a795b'} />
    {id === 'research' ? <group>
      <Block at={[.13, 1.12, .2]} size={[.9, .05, .72]} color="#475f5c" />
      <Block at={[.13, 1.16, .2]} size={[.82, .04, .65]} color="#e4d8b3" />
      <group name="research-cover" ref={cover} position={[.13, 1.19, -.13]}><Block at={[0, 0, .33]} size={[.9, .025, .68]} color="#52665e" /></group>
      <Block at={[-.83, 1.14, -.25]} size={[.5, .12, .65]} color="#475b73" />
      <Block at={[-.79, 1.26, -.26]} size={[.43, .12, .61]} color="#d6bd86" />
      <mesh position={[.91, 1.12, -.3]} castShadow><cylinderGeometry args={[.18, .23, .08, 20]} /><meshStandardMaterial color="#a88c5c" /></mesh>
      <Block at={[.91, 1.46, -.3]} size={[.035, .65, .035]} color="#9a8156" />
      <mesh position={[.91, 1.82, -.3]} castShadow><coneGeometry args={[.34, .35, 6]} /><meshStandardMaterial color="#d9bc82" emissive="#e5a850" emissiveIntensity={hover || active ? .55 : .18} /></mesh>
      <pointLight position={[.91, 1.64, -.25]} color="#ffce89" intensity={hover || active ? 3.2 : 1.5} distance={4} />
    </group> : <group>
      <Block at={[-.62, 1.16, -.36]} size={[.6, .05, .46]} color="#2f4f5a" rotation={[-.3, 0, 0]} />
      <mesh position={[.24, 1.19, .13]} castShadow><cylinderGeometry args={[.38, .43, .2, 24]} /><meshStandardMaterial color="#d0d1ba" roughness={.75} /></mesh>
      <mesh position={[.24, 1.49, .13]} castShadow><cylinderGeometry args={[.23, .34, .42, 24]} /><meshStandardMaterial color="#d9dbc7" roughness={.75} /></mesh>
      <group name="robotics-head" ref={head} position={[.24, 1.86, .13]}>
        <mesh scale={[.58, .38, .37]} castShadow><sphereGeometry args={[1, 28, 18]} /><meshStandardMaterial color="#ebe6d1" roughness={.7} /></mesh>
        {[-.23, .23].map(x => <mesh key={x} position={[x, .04, .315]}><sphereGeometry args={[.095, 16, 12]} /><meshStandardMaterial color="#233e45" roughness={.35} /></mesh>)}
        {[-.46, .46].map(x => <mesh key={x} position={[x, .28, -.08]} rotation={[0, 0, x > 0 ? -.3 : .3]} castShadow><coneGeometry args={[.09, .4, 12]} /><meshStandardMaterial color="#dddcc6" /></mesh>)}
      </group>
      <group ref={arm} position={[.58, 1.57, .13]}><mesh position={[.13, -.13, 0]} rotation={[0, 0, -.7]} castShadow><cylinderGeometry args={[.065, .085, .39, 12]} /><meshStandardMaterial color="#d8d9c2" /></mesh></group>
      <Block at={[.93, 1.18, -.3]} size={[.48, .14, .4]} color="#34484e" />
      <Block at={[.93, 1.27, -.3]} size={[.35, .025, .27]} color="#5a867a" />
    </group>}
    <mesh position={[0, 1.15, 0]} onPointerOver={event => { event.stopPropagation(); onHover(id) }} onPointerOut={() => onHover(null)} onClick={event => { event.stopPropagation(); onSelect(id) }}><boxGeometry args={[2.75, 2.4, 1.65]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
  </group>
}

function ViewResponse({ station, labels }: { station: Selection; labels: Labels }) {
  const { camera, size, invalidate } = useThree()
  const aim = useRef(new Vector3(...poses.overview.target))
  const desired = useRef(new Vector3())
  const target = useRef(new Vector3())
  const projected = useRef(new Vector3())
  useEffect(() => { invalidate() }, [station, size.width, size.height, invalidate])
  useFrame((_, delta) => {
    const pose = poses[station ?? 'overview']
    target.current.set(...pose.target)
    desired.current.set(...pose.camera)
    if (!station) desired.current.sub(target.current).multiplyScalar(Math.max(1, 1.55 / (size.width / size.height))).add(target.current)
    const alpha = 1 - Math.exp(-Math.min(delta, .1) * 8)
    camera.position.lerp(desired.current, alpha)
    aim.current.lerp(target.current, alpha)
    camera.lookAt(aim.current)
    camera.updateMatrixWorld()
    const moving = camera.position.distanceTo(desired.current) > .006 || aim.current.distanceTo(target.current) > .006
    if (moving) invalidate()
    for (const id of ['research', 'robotics'] as StationId[]) {
      const label = labels[id].current
      if (!label) continue
      projected.current.set(...anchors[id]).project(camera)
      // Separate overview touch targets on narrow screens. Direct project
      // navigation remains available while the camera focuses one station.
      const narrow = size.width < 500
      const x = !station && narrow ? (id === 'research' ? 30 : 70) : (projected.current.x + 1) * 50
      label.style.left = `${x}%`
      label.style.top = `${(1 - projected.current.y) * 50}%`
      label.style.visibility = (narrow && station && station !== id) || projected.current.x < -1 || projected.current.x > 1 || projected.current.y < -.9 || projected.current.y > .95 ? 'hidden' : 'visible'
    }
    const debug = (window as DebugWindow).__exploreDebug
    if (debug) { debug.ready = true; debug.settled = !moving }
  })
  return null
}

export default function ExploreCanvas({ station, hover, dark, labels, onSelect, onHover, onFailure }: { station: Selection; hover: Selection; dark: boolean; labels: Labels; onSelect: (station: Selection) => void; onHover: (station: Selection) => void; onFailure: () => void }) {
  return <Canvas aria-hidden="true" dpr={[1, 2]} shadows="percentage" frameloop="demand" camera={{ position: poses.overview.camera, fov: 40, near: .1, far: 80 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} onCreated={({ gl, camera, scene, setFrameloop }) => {
    gl.toneMapping = AgXToneMapping; gl.toneMappingExposure = 1.1
    if (import.meta.env.DEV) (window as DebugWindow).__exploreDebug = { gl, camera, scene, ready: false, settled: false, setFrameloop }
    gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); if (gl.domElement.isConnected) onFailure() }, { once: true })
  }}>
    <ViewResponse station={station} labels={labels} />
    <hemisphereLight args={[dark ? '#b1cbd2' : '#edf0d8', '#5d5547', dark ? 1.25 : 1.6]} />
    <directionalLight position={[1, 7, 5]} color="#f4d6a5" intensity={dark ? 1.5 : 2.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-6} shadow-bias={-.001} />
    <directionalLight position={[-5, 5, -1]} color="#b2d7da" intensity={.7} />
    <Room dark={dark} />
    <Station id="research" active={station === 'research'} hover={hover === 'research'} onSelect={onSelect} onHover={onHover} />
    <Station id="robotics" active={station === 'robotics'} hover={hover === 'robotics'} onSelect={onSelect} onHover={onHover} />
  </Canvas>
}
