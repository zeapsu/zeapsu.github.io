import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AgXToneMapping, Box3, PerspectiveCamera, Vector3 } from 'three'
import type { Group, Mesh, Scene, WebGLRenderer } from 'three'
import { poseAt } from './path'
import type { JourneyState, Vec3 } from './path'

type Debug = { gl: WebGLRenderer; camera: PerspectiveCamera; scene: Scene; ready: boolean; settled: boolean; progress: number; poseAt: typeof poseAt; validateRoute: () => { samples: number; collisions: { progress: number; object: string }[] }; setFrameloop: (mode: 'always' | 'demand' | 'never') => void }
type DebugWindow = Window & { __journeyDebug?: Debug }
function Block({ at, size, color = '#8a6545', rotation = [0, 0, 0], name }: { at: Vec3; size: Vec3; color?: string; rotation?: Vec3; name?: string }) {
  return <mesh name={name} position={at} rotation={rotation} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.92} /></mesh>
}
function Rock({ at, scale, color }: { at: Vec3; scale: Vec3; color: string }) {
  return <mesh position={at} scale={scale} rotation={[.05, at[0] * .15, -.05]} castShadow receiveShadow><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={color} flatShading roughness={1} /></mesh>
}
function Tree({ at, scale = 1 }: { at: Vec3; scale?: number }) {
  return <group position={at} scale={scale}><Block at={[0, 1.4, 0]} size={[.35, 2.8, .35]} color="#75543f" />
    <mesh position={[0, 3, 0]} scale={[1.8, 1.45, 1.6]} castShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={at[0] < 0 ? '#667d46' : '#b6a16c'} flatShading roughness={1} /></mesh>
  </group>
}
function Landscape({ dark }: { dark: boolean }) {
  return <group>
    <Block at={[0, -.7, 0]} size={[130, .8, 130]} color={dark ? '#324c48' : '#879779'} />
    <Block at={[0, -.15, 19]} size={[13, .06, 36]} color={dark ? '#356c79' : '#71a6a0'} />
    {[-1, 1].flatMap(side => Array.from({ length: 8 }, (_, i) => <Rock key={`${side}:${i}`} at={[side * (12 + (i % 3) * 5), i % 2 ? 2 : 0, 10 - i * 10]} scale={[7, 3 + (i % 3) * 3, 8]} color={dark ? '#485552' : ['#ac9c80', '#96997d', '#bbac8c'][i % 3]} />))}
    {[-1, 1].flatMap(side => Array.from({ length: 5 }, (_, i) => <Rock key={`spire:${side}:${i}`} at={[side * (21 + i * 7), 10 + i % 3 * 4, -25 - i % 3 * 13]} scale={[5 + i % 2, 15 + i % 3 * 6, 6]} color={dark ? '#526072' : '#b6a791'} />))}
    <Block at={[-8, 17, -44]} size={[6, 33, 7]} color="#b0a08c" rotation={[0, 0, -.12]} />
    <Block at={[8, 19, -44]} size={[7, 37, 7]} color="#b0a08c" rotation={[0, 0, .15]} />
    <Rock at={[0, 31, -44]} scale={[12, 5, 6]} color="#baa991" />
    {Array.from({ length: 14 }, (_, i) => <Tree key={i} at={[i % 2 ? -13 - i % 3 * 4 : 16 + i % 4 * 3, 0, 22 - i * 5]} scale={.8 + i % 3 * .2} />)}
    <Block at={[0, -.02, 10.5]} size={[3.6, .22, 8]} color="#977254" />
    {Array.from({ length: 15 }, (_, i) => <Block key={`plank:${i}`} at={[0, .105, 6.7 + i * .54]} size={[3.7, .03, .035]} color="#624a37" />)}
    {[-1.85, 1.85].flatMap(x => [7, 10.5, 14].map(z => <Block key={`${x}:${z}`} at={[x, .55, z]} size={[.13, 1.2, .13]} color="#84603e" />))}
    {[-1.85, 1.85].map(x => <Block key={x} at={[x, 1.03, 10.5]} size={[.1, .1, 7.3]} color="#a98659" />)}
    <Block at={[0, -.015, 5.5]} size={[3.5, .15, 2.1]} color="#b0a28d" />
  </group>
}
function House({ dark }: { dark: boolean }) {
  const wall = dark ? '#536368' : '#bcb8a2'
  return <group name="house">
    <Block at={[0, -.08, 0]} size={[12.4, .25, 12.4]} color="#9e8564" />
    {Array.from({ length: 13 }, (_, i) => <Block key={i} at={[-6 + i, .05, 0]} size={[.018, .005, 12]} color="#756851" />)}
    <Block name="wall-left" at={[-6, 1.9, 0]} size={[.25, 3.8, 12]} color={wall} />
    <Block name="wall-right" at={[6, 1.9, 0]} size={[.25, 3.8, 12]} color={wall} />
    <Block name="wall-back" at={[0, 1.9, -6]} size={[12, 3.8, .25]} color={wall} />
    <Block name="wall-front-left" at={[-3.7, 1.9, 6]} size={[4.6, 3.8, .25]} color={wall} />
    <Block name="wall-front-right" at={[3.7, 1.9, 6]} size={[4.6, 3.8, .25]} color={wall} />
    <Block name="door-lintel" at={[0, 3.6, 6]} size={[2.8, .4, .3]} />
    {[-1.45, 1.45].map(x => <Block key={x} at={[x, 1.7, 6.1]} size={[.18, 3.4, .35]} />)}
    <Block at={[1.6, 1.65, 5.4]} size={[.16, 3.25, 1.35]} color="#75563c" rotation={[0, -.5, 0]} />
    {[-5.8, 5.8].flatMap(x => [-5.8, 5.8].map(z => <Block key={`${x}:${z}`} at={[x, 1.9, z]} size={[.25, 3.9, .3]} />))}
    <Block name="roof-left" at={[-3.1, 5.15, 0]} size={[7, .22, 13]} color={dark ? '#485c69' : '#6c7a80'} rotation={[0, 0, .43]} />
    <Block name="roof-right" at={[3.1, 5.15, 0]} size={[7, .22, 13]} color={dark ? '#485c69' : '#6c7a80'} rotation={[0, 0, -.43]} />
    <Block at={[0, 6.65, 0]} size={[.25, .25, 13.1]} color="#596973" />
    <Block at={[4.65, 4.6, -4.4]} size={[.9, 3.4, .9]} color="#8c8075" />
    {[-3.7, 3.7].map(x => <group key={x}><Block at={[x, 2.1, 6.15]} size={[1.2, 1.45, .06]} color="#e3c388" /><Block at={[x, 2.1, 6.21]} size={[.07, 1.5, .07]} /><Block at={[x, 2.1, 6.21]} size={[1.25, .07, .07]} /></group>)}
    <pointLight position={[0, 2.8, 2]} color="#ffe3b0" intensity={18} distance={12} decay={2} />
  </group>
}
function Table({ at }: { at: Vec3 }) {
  return <group position={at}><Block at={[0, 1, 0]} size={[2.8, .18, 1.6]} color="#a78456" />{[-1.15, 1.15].flatMap(x => [-.58, .58].map(z => <Block key={`${x}:${z}`} at={[x, .46, z]} size={[.16, .95, .16]} />))}</group>
}
function Interior({ chapter, onDetails }: { chapter: number; onDetails: (chapter: number) => void }) {
  return <group>
    {[.3, 1.8, 3.3].map((z, i) => <group key={z} position={[-5.76, 2.15, z]} rotation={[0, Math.PI / 2, 0]}>
      <Block at={[0, 0, 0]} size={[1.05, 1.25, .1]} color="#967343" />
      <Block at={[0, 0, .07]} size={[.86, 1.06, .03]} color={['#829b90', '#c8bb92', '#a0afb3'][i]} />
      <Block at={[0, -.32, .1]} size={[.5, .04, .03]} color="#e5dcc0" />
    </group>)}
    <group position={[-5.3, 0, -3.1]}><Block at={[0, 1.45, 0]} size={[1, 2.9, 2.8]} color="#755f47" />
      {[.4, 1.1, 1.8, 2.5].map((y, row) => <group key={y}><Block at={[.54, y, 0]} size={[.13, .08, 2.7]} color="#b09668" />{Array.from({ length: 7 }, (_, i) => <Block key={i} at={[.52, y + .28, -.98 + i * .3]} size={[.3, .5, .19]} color={['#536f6a', '#b6a07a', '#7b8597'][(i + row) % 3]} />)}</group>)}
    </group>
    <Table at={[-3.9, 0, -2.7]} />
    <group name="research-notebook" position={[-4.05, 1.13, -2.7]} onClick={event => { event.stopPropagation(); onDetails(3) }}>
      <Block at={[0, 0, 0]} size={[1, .08, .75]} color="#e4dabd" />
      <Block at={[0, .06, -.27]} size={[1, .03, .75]} color="#536d61" rotation={[-(chapter === 3 ? .55 : .1), 0, 0]} />
    </group>
    <Block at={[-3.05, 1.13, -3.03]} size={[.3, .1, .3]} color="#b39a65" />
    <pointLight position={[-3.05, 1.9, -3.03]} color="#ffd09a" intensity={7} distance={7} />
    <Table at={[4.1, 0, -3]} />
    <group name="robot" position={[4.1, 1.1, -3]} onClick={event => { event.stopPropagation(); onDetails(4) }}>
      <mesh position={[0, .14, 0]} castShadow><cylinderGeometry args={[.35, .45, .28, 20]} /><meshStandardMaterial color="#d6d6bf" /></mesh>
      <mesh position={[0, .43, 0]} castShadow><cylinderGeometry args={[.21, .3, .42, 20]} /><meshStandardMaterial color="#e1dec7" /></mesh>
      <group rotation={[0, chapter === 4 ? -.25 : -.05, 0]} position={[0, .82, 0]}><mesh scale={[.56, .35, .36]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#e8e5d0" /></mesh>{[-.23, .23].map(x => <mesh key={x} position={[x, .02, .315]}><sphereGeometry args={[.09, 12, 8]} /><meshStandardMaterial color="#25434b" /></mesh>)}</group>
    </group>
    <Block at={[4.95, 1.14, -2.9]} size={[.5, .1, .4]} color="#406367" />
    <group position={[4.7, 0, -4.8]}>
      <Block at={[0, .85, 0]} size={[1.45, 1.7, .8]} color="#8c7c69" />
      <Block at={[0, .7, .43]} size={[.85, 1.05, .05]} color="#42352c" />
      <mesh position={[0, .53, .5]}><coneGeometry args={[.24, .6, 6]} /><meshStandardMaterial color="#edb35c" emissive="#ea793b" emissiveIntensity={.7} /></mesh>
      <pointLight position={[0, .85, .8]} color="#ffb96a" intensity={9} distance={8} />
    </group>
    <group position={[3, 0, 3.6]}>
      <Block at={[0, .6, 0]} size={[3, 1.2, 1.1]} color="#7d725d" /><Block at={[0, 1.23, 0]} size={[3.15, .12, 1.25]} color="#aaa48e" />
      <mesh position={[.3, 1.46, 0]} castShadow><cylinderGeometry args={[.32, .27, .35, 18]} /><meshStandardMaterial color="#52666a" /></mesh>
    </group>
    <Table at={[0, 0, -4.3]} />
    <group name="contact-book" position={[0, 1.13, -4.3]}>
      <Block at={[0, 0, 0]} size={[1.7, .05, 1.1]} color="#506558" />
      {[-.43, .43].map(x => <Block key={x} at={[x, .06, 0]} size={[.82, .06, 1.04]} color="#eee5c9" rotation={[0, 0, x < 0 ? .08 : -.08]} />)}
    </group>
  </group>
}
function Smoke() {
  const chimney = useRef<Group>(null)
  const steam = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    chimney.current?.children.forEach((particle, i) => { particle.position.y = 6.5 + ((t * .35 + i * .37) % 2.6); particle.position.x = 4.65 + Math.sin(t * .4 + i) * .2; particle.scale.setScalar(.2 + (particle.position.y - 6.5) * .14) })
    if (steam.current) steam.current.position.y = 1.95 + Math.sin(t * .8) * .12
  })
  return <><group ref={chimney}>{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[4.65, 6.5 + i * .37, -4.4]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#dfd8c9" transparent opacity={.25} depthWrite={false} /></mesh>)}</group><mesh ref={steam} position={[3.3, 1.95, 3.6]} scale={[.15, .35, .15]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#eee2c9" transparent opacity={.25} depthWrite={false} /></mesh></>
}
function CameraPath({ state, dark }: { state: RefObject<JourneyState>; dark: boolean }) {
  const { camera: base, size, gl } = useThree()
  const camera = base as PerspectiveCamera
  const target = useRef(new Vector3())
  const desired = useRef(new Vector3())
  const aim = useRef(new Vector3())
  const first = useRef(true)
  const previous = useRef(0)
  useEffect(() => { gl.toneMappingExposure = dark ? .9 : 1.1 }, [gl, dark])
  useEffect(() => {
    // Shift the scene's subject left of the desktop reading panel.
    if (size.width > 760) camera.setViewOffset(size.width, size.height, size.width * .17, 0, size.width, size.height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  useFrame((_, delta) => {
    const pose = poseAt(state.current.progress, size.width / size.height)
    desired.current.set(...pose.position); target.current.set(...pose.target)
    // Scrollbar jumps and shortcuts skip to a safe pose instead of taking a
    // diagonal through walls. Normal scrolling follows the connected route.
    const snap = first.current || state.current.jump || Math.abs(state.current.progress - previous.current) > .75
    const alpha = snap ? 1 : 1 - Math.exp(-Math.min(delta, .1) * 14)
    camera.position.lerp(desired.current, alpha); aim.current.lerp(target.current, alpha)
    camera.fov += (pose.fov - camera.fov) * alpha
    camera.lookAt(aim.current); camera.updateProjectionMatrix(); camera.updateMatrixWorld()
    first.current = false; state.current.jump = false
    previous.current = state.current.progress
    const debug = (window as DebugWindow).__journeyDebug
    if (debug) { debug.ready = true; debug.progress = state.current.progress; debug.settled = camera.position.distanceTo(desired.current) < .004 && aim.current.distanceTo(target.current) < .004 }
  })
  return null
}
export default function JourneyCanvas({ state, chapter, dark, active, onDetails, onFailure }: { state: RefObject<JourneyState>; chapter: number; dark: boolean; active: boolean; onDetails: (chapter: number) => void; onFailure: () => void }) {
  return <Canvas aria-hidden="true" dpr={[1, 2]} shadows="percentage" frameloop={active ? 'always' : 'never'} camera={{ position: [17, 11, 30], fov: 48, near: .08, far: 180 }} gl={{ antialias: true, powerPreference: 'low-power' }} onCreated={({ gl, camera, scene, setFrameloop }) => {
    gl.toneMapping = AgXToneMapping; gl.toneMappingExposure = dark ? .9 : 1.1
    if (import.meta.env.DEV) (window as DebugWindow).__journeyDebug = { gl, camera: camera as PerspectiveCamera, scene, ready: false, settled: false, progress: 0, poseAt, setFrameloop, validateRoute: () => {
      scene.updateMatrixWorld(true)
      const colliders: { name: string; box: Box3 }[] = []
      scene.traverse(object => { if (/^(wall-|roof-|door-lintel)/.test(object.name)) colliders.push({ name: object.name, box: new Box3().setFromObject(object).expandByScalar(.12) }) })
      const collisions: { progress: number; object: string }[] = []
      for (let i = 0; i <= 500; i++) {
        const progress = i / 100
        const point = new Vector3(...poseAt(progress).position)
        colliders.forEach(({ name, box }) => { if (box.containsPoint(point)) collisions.push({ progress, object: name }) })
      }
      return { samples: 501, collisions }
    } }
    gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); if (gl.domElement.isConnected) onFailure() }, { once: true })
  }}>
    <color attach="background" args={[dark ? '#263b50' : '#e8c5a3']} />
    <fog attach="fog" args={[dark ? '#263b50' : '#e8c5a3', 38, 150]} />
    <CameraPath state={state} dark={dark} />
    <hemisphereLight args={[dark ? '#a0b4ca' : '#ede3c9', '#5b6249', dark ? 1.05 : 1.65]} />
    <directionalLight position={[-12, 25, 15]} color="#ffe1ad" intensity={dark ? .6 : 2.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-bias={-.001} />
    <Landscape dark={dark} /><House dark={dark} /><Interior chapter={chapter} onDetails={onDetails} /><Smoke />
  </Canvas>
}
