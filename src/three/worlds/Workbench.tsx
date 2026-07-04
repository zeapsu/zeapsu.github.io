// The workbench: the Roboticist world, and the honest one. This job is level 1
// -- genuinely leveling -- so the world is visibly under construction: a
// schematic-grid bench, a ghost part still in wireframe, a small Jetson board
// blinking away. Its centerpiece is a real inverse-kinematics arm: a 3-link
// manipulator solved live with cyclic coordinate descent (CCD), tracking a
// slowly orbiting target the way a real servo arm chases a setpoint. Like the
// Physicist's Gross-Pitaevskii sim, the math is real, not mimed -- the joint
// angles you see are the solver's actual output.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../../sim/gpe'

const BG = '#0b0705'

// arm geometry: 3 links rooted at the bench, reaching in a vertical plane
// facing the camera (arm-local u = world x, v = world y, at fixed world z)
const SEG = [3.2, 2.6, 1.8]
const REACH = SEG.reduce((a, b) => a + b, 0)
const BASE = new THREE.Vector3(-0.5, 1.7, -9)
// joint limits keep the linkage reading as an arm, never folding through itself
const LIMITS: [number, number][] = [
  [0.15, 2.5],
  [-2.3, -0.05],
  [-2.0, 0.5],
]

// forward kinematics: absolute angle per link is the running sum of relatives.
// returns the 4 joint points (u,v) and each link's absolute angle.
function fk(rel: number[]) {
  const pts: [number, number][] = [[0, 0]]
  const ang: number[] = []
  let a = 0
  let u = 0
  let v = 0
  for (let i = 0; i < SEG.length; i++) {
    a += rel[i]
    u += Math.cos(a) * SEG[i]
    v += Math.sin(a) * SEG[i]
    ang.push(a)
    pts.push([u, v])
  }
  return { pts, ang }
}

// one CCD pass, base-ward: rotate each joint to swing the tip toward target,
// clamped per-frame so the arm eases to the setpoint instead of snapping.
function ccdStep(rel: number[], tu: number, tv: number, maxStep: number) {
  for (let i = SEG.length - 1; i >= 0; i--) {
    const { pts } = fk(rel)
    const tip = pts[SEG.length]
    const jx = pts[i][0]
    const jy = pts[i][1]
    const ex = tip[0] - jx
    const ey = tip[1] - jy
    const txx = tu - jx
    const tyy = tv - jy
    // signed angle from (tip-joint) to (target-joint)
    const d = Math.atan2(ex * tyy - ey * txx, ex * txx + ey * tyy)
    const step = Math.max(-maxStep, Math.min(maxStep, d))
    rel[i] = Math.max(LIMITS[i][0], Math.min(LIMITS[i][1], rel[i] + step))
  }
}

function IKArm({ frozen, accent, accent2 }: { frozen: boolean; accent: THREE.Color; accent2: THREE.Color }) {
  const rel = useRef<number[]>([1.15, -0.9, -0.6])
  const segRefs = useRef<(THREE.Mesh | null)[]>([])
  const jointRefs = useRef<(THREE.Mesh | null)[]>([])
  const tip = useRef<THREE.Group>(null!)
  const tipLight = useRef<THREE.PointLight>(null!)
  const t = useRef(0)

  // metals with a warm foundry glow baked in via emissive, so the arm reads as
  // lit metal even when it falls behind the translucent panels (a dark PBR
  // metal would silhouette to near-black there, like an unlit prop)
  const linkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5a4a3c', roughness: 0.3, metalness: 0.9 }), [])
  const jointMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b5744', roughness: 0.28, metalness: 0.95 }), [])
  const tipMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ toneMapped: false })
    m.color.copy(accent).multiplyScalar(2.4)
    return m
  }, [accent])

  useEffect(() => {
    tipMat.color.copy(accent).multiplyScalar(2.4)
    linkMat.emissive.copy(accent).multiplyScalar(0.35)
    jointMat.emissive.copy(accent).multiplyScalar(0.45)
  }, [accent, tipMat, linkMat, jointMat])

  const apply = () => {
    const { pts, ang } = fk(rel.current)
    for (let i = 0; i < SEG.length; i++) {
      const s = segRefs.current[i]
      if (s) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2
        const my = (pts[i][1] + pts[i + 1][1]) / 2
        s.position.set(BASE.x + mx, BASE.y + my, BASE.z)
        s.rotation.z = ang[i]
        s.scale.x = SEG[i]
      }
    }
    for (let i = 0; i <= SEG.length; i++) {
      const j = jointRefs.current[i]
      if (j) j.position.set(BASE.x + pts[i][0], BASE.y + pts[i][1], BASE.z)
    }
    const end = pts[SEG.length]
    if (tip.current) tip.current.position.set(BASE.x + end[0], BASE.y + end[1], BASE.z)
    if (tipLight.current) tipLight.current.color.copy(accent)
  }

  // target the arm chases: a slow orbit kept inside the reachable envelope
  const targetAt = (time: number) => {
    const cu = 2.4 + Math.sin(time * 0.23) * 1.0
    const cv = 4.4 + Math.cos(time * 0.31) * 1.6
    const r = Math.hypot(cu, cv)
    const k = r > REACH * 0.98 ? (REACH * 0.98) / r : 1
    return [cu * k, cv * k] as [number, number]
  }

  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (frozen) {
      // settle to a formed reaching pose for reduced-motion / static frames
      for (let i = 0; i < 60; i++) {
        const [tu, tv] = targetAt(3.0)
        ccdStep(rel.current, tu, tv, 0.6)
      }
      apply()
      invalidate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozen, invalidate])

  useFrame((_, delta) => {
    if (frozen) return
    t.current += delta
    const [tu, tv] = targetAt(t.current)
    // two passes: enough to track a slow target smoothly
    ccdStep(rel.current, tu, tv, delta * 2.4)
    ccdStep(rel.current, tu, tv, delta * 2.4)
    apply()
    if (tipLight.current) tipLight.current.intensity = 9 + Math.sin(t.current * 6.0) * 2.2
  })

  return (
    <>
      <mesh position={[BASE.x, BASE.y - 0.9, BASE.z]}>
        <cylinderGeometry args={[0.9, 1.1, 1.0, 20]} />
        <primitive object={jointMat} attach="material" />
      </mesh>
      {SEG.map((_, i) => (
        <mesh key={`s${i}`} ref={(m) => (segRefs.current[i] = m)} material={linkMat}>
          {/* unit box along +x, scaled to link length each frame */}
          <boxGeometry args={[1, 0.42, 0.5]} />
        </mesh>
      ))}
      {SEG.map((_, i) => (
        <mesh key={`j${i}`} ref={(m) => (jointRefs.current[i] = m)} material={jointMat}>
          <sphereGeometry args={[0.38, 16, 16]} />
        </mesh>
      ))}
      <mesh ref={(m) => (jointRefs.current[SEG.length] = m)} material={jointMat}>
        <sphereGeometry args={[0.3, 16, 16]} />
      </mesh>
      {/* glowing tool tip + its cast light */}
      <group ref={tip}>
        <mesh material={tipMat}>
          <sphereGeometry args={[0.22, 16, 16]} />
        </mesh>
        <pointLight ref={tipLight} distance={12} intensity={9} color={accent} />
        <Sparks accent={accent} accent2={accent2} frozen={frozen} />
      </group>
    </>
  )
}

// sparks flung off the tool tip (parented to the moving tip group)
function Sparks({ accent, accent2, frozen }: { accent: THREE.Color; accent2: THREE.Color; frozen: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(7788)
    const count = 44
    const seed = new Float32Array(count)
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) seed[i] = rand()
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        uniform float uTime; attribute float aSeed; varying float vA;
        void main(){
          float life = fract(uTime * (0.9 + aSeed*0.7) + aSeed);
          float ang = aSeed * 6.2831;
          float spd = 0.6 + aSeed * 1.4;
          vec3 p;
          p.x = cos(ang) * spd * life;
          p.y = 0.9*life - 3.2*life*life;      // arc up then fall
          p.z = sin(ang) * spd * life;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (2.0 + aSeed*3.0) * (90.0 / -mv.z) * (1.0 - life);
          vA = (1.0 - life);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uA; uniform vec3 uB; varying float vA;
        void main(){ float d=length(gl_PointCoord-0.5); vec3 c=mix(uB,uA,vA); gl_FragColor=vec4(c*smoothstep(0.5,0.0,d)*(0.6+vA), 1.0); }`,
      uniforms: { uTime: { value: 0 }, uA: { value: accent }, uB: { value: accent2 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry, material }
  }, [accent, accent2])
  useFrame((_, d) => {
    if (frozen) {
      if (material.uniforms.uTime.value === 0) material.uniforms.uTime.value = 0.35
      return
    }
    material.uniforms.uTime.value += d
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

// the bench top: a dark surface with an emissive schematic grid + a warm halo
// pooled under the arm base, like a lit drafting table
function Bench({ accent }: { accent: THREE.Color }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: /* glsl */ `
          uniform vec3 uAccent; uniform vec3 uBg; varying vec2 vUv; varying vec3 vW;
          float grid(vec2 uv, float n, float w){
            vec2 g = abs(fract(uv*n - 0.5) - 0.5) / fwidth(uv*n);
            float l = min(g.x, g.y);
            return 1.0 - min(l*w, 1.0);
          }
          void main(){
            // pool of warm light under the arm base (bench-local ~[-0.5,1.7])
            float d = distance(vW.xz, vec2(-0.5, -9.0));
            float halo = exp(-d*d*0.02);
            float fine = grid(vUv, 40.0, 1.0) * 0.35;
            float major = grid(vUv, 8.0, 1.4) * 0.6;
            float lines = (fine + major) * (0.25 + halo);
            vec3 col = uBg + uAccent * (lines + halo*0.18);
            float fog = smoothstep(30.0, 80.0, distance(cameraPosition, vW));
            col = mix(col, uBg, fog);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        uniforms: { uAccent: { value: accent }, uBg: { value: new THREE.Color(BG) } },
      }),
    [accent]
  )
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 60, 1, 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return <mesh geometry={geo} material={material} position={[0, 0.7, -9]} />
}

// the part still on the drawing board: a wireframe frame, honestly unbuilt,
// slowly turning. "Level 1: currently leveling" made literal.
function GhostPart({ accent, frozen }: { accent: THREE.Color; frozen: boolean }) {
  const ref = useRef<THREE.LineSegments>(null!)
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.5, 1)), [])
  const mat = useMemo(() => {
    const m = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5, toneMapped: false })
    m.color.copy(accent).multiplyScalar(1.4)
    return m
  }, [accent])
  useEffect(() => {
    mat.color.copy(accent).multiplyScalar(1.4)
  }, [accent, mat])
  useFrame((_, d) => {
    if (frozen) return
    if (ref.current) {
      ref.current.rotation.y += d * 0.3
      ref.current.rotation.x += d * 0.12
    }
  })
  return <lineSegments ref={ref} geometry={geo} material={mat} position={[6.5, 4.2, -10]} />
}

// small dev board on the bench with a blinking status LED (the Jetson)
function DevBoard({ frozen }: { frozen: boolean }) {
  const led = useRef<THREE.Mesh>(null!)
  const ledMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#39ff88', toneMapped: false }), [])
  useFrame(({ clock }) => {
    if (frozen) return
    // heartbeat blink
    const b = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3.4)
    ledMat.color.setRGB(0.1 + 0.2 * b, 0.7 + 0.9 * b, 0.35 + 0.4 * b)
  })
  return (
    <group position={[3.4, 1.15, -6.5]} rotation={[0, -0.5, 0]}>
      <mesh>
        <boxGeometry args={[2.2, 0.18, 1.5]} />
        <meshStandardMaterial color={'#0c2417'} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.0, 0.24, 1.0]} />
        <meshStandardMaterial color={'#161616'} roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh ref={led} material={ledMat} position={[0.85, 0.14, 0.6]}>
        <boxGeometry args={[0.12, 0.06, 0.12]} />
      </mesh>
    </group>
  )
}

// warm foundry dust rising through the light
function Embers({ accent, frozen }: { accent: THREE.Color; frozen: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(1357)
    const count = 150
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 30
      pos[i * 3 + 1] = rand() * 14
      pos[i * 3 + 2] = -9 + (rand() - 0.5) * 16
      seed[i] = rand()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        uniform float uTime; attribute float aSeed; varying float vA;
        void main(){
          vec3 p = position;
          p.y = mod(p.y + uTime*(0.18+aSeed*0.3), 14.0);
          p.x += sin(uTime*0.25+aSeed*6.28)*0.5;
          vec4 mv = modelViewMatrix*vec4(p,1.0);
          gl_PointSize = min((1.0+aSeed*1.8)*(100.0/-mv.z), 4.0);
          vA = (0.08+aSeed*0.16)*clamp((-mv.z-3.0)/12.0,0.0,1.0);
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uA; varying float vA;
        void main(){ float d=length(gl_PointCoord-0.5); gl_FragColor=vec4(uA*smoothstep(0.5,0.0,d)*vA,1.0);}`,
      uniforms: { uTime: { value: 0 }, uA: { value: accent } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry, material }
  }, [accent])
  useFrame((_, d) => {
    if (frozen) {
      if (material.uniforms.uTime.value === 0) material.uniforms.uTime.value = 4.0
      return
    }
    material.uniforms.uTime.value += d
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

export function Workbench({ frozen, up, down }: { frozen: boolean; up: string; down: string }) {
  const accent = useMemo(() => new THREE.Color(up), [up])
  const accent2 = useMemo(() => new THREE.Color(down), [up, down])
  useEffect(() => {
    accent.set(up)
    accent2.set(down)
  }, [up, down, accent, accent2])

  return (
    <>
      <color attach="background" args={[BG]} />
      <ambientLight intensity={0.35} />
      {/* warm foundry key + cool fill for metal reads */}
      <pointLight position={[-6, 9, 2]} intensity={45} distance={40} color={up} />
      <pointLight position={[9, 6, 3]} intensity={16} distance={34} color={'#6f8bd0'} />
      <Bench accent={accent} />
      <IKArm frozen={frozen} accent={accent} accent2={accent2} />
      <GhostPart accent={accent} frozen={frozen} />
      <DevBoard frozen={frozen} />
      <Embers accent={accent} frozen={frozen} />
    </>
  )
}
