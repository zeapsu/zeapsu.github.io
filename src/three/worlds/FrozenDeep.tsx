// The frozen deep: the Physicist world. A BEC is the coldest place in the
// universe; the cavern stages that fact, and the aurora IS the live sim:
// the spin history texture drives curtain color and banding (teal spin-up,
// amber spin-down, dark domain walls between bands). The curtain's vertical
// axis is history age, so domain evolution streams upward in real time.
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { createSimFeed, resolveVisitSeed, SIM_N, HISTORY_ROWS } from '../simFeed'
import { mulberry32 } from '../../sim/gpe'

const BG = '#020509'
const UP_COLOR = '#4fd8c8' // spin-up crest teal (site accent)
const DOWN_COLOR = '#f0a848' // spin-down amber
const CORE_COLOR = '#d9fff2' // hot lower border of the curtains
const WORLD_SPAN = 80 // world-x units mapped across the periodic sim ring

// GLSL: sample the spin field, periodic in x, bilinear so bands stay smooth
// (float textures keep NearestFilter for portability; interp is manual).
const SPIN_SAMPLE = /* glsl */ `
uniform sampler2D uSpin;
uniform float uHead;
const float GN = ${SIM_N.toFixed(1)};
const float GM = ${HISTORY_ROWS.toFixed(1)};
float spinTexel(float col, float age) {
  float row = mod(uHead - age + 3.0 * GM, GM);
  return texture2D(uSpin, vec2((mod(col + GN, GN) + 0.5) / GN, (row + 0.5) / GM)).r;
}
float spinAt(float u, float age) {
  float col = u * GN;
  float c0 = floor(col);
  float fc = col - c0;
  float a0 = floor(age);
  float fa = age - a0;
  float s00 = spinTexel(c0, a0);
  float s10 = spinTexel(c0 + 1.0, a0);
  float s01 = spinTexel(c0, a0 + 1.0);
  float s11 = spinTexel(c0 + 1.0, a0 + 1.0);
  return mix(mix(s00, s10, fc), mix(s01, s11, fc), fa);
}
`

interface Shared {
  uSpin: { value: THREE.DataTexture }
  uHead: { value: number }
  uTime: { value: number }
}

// ---- aurora curtains -------------------------------------------------------

const auroraVertex = /* glsl */ `
uniform float uTime;
uniform float uSwayPhase;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float sway = sin(uv.x * 7.0 + uSwayPhase + uTime * 0.12)
             + 0.6 * sin(uv.x * 17.0 - uTime * 0.07 + uSwayPhase * 2.0);
  p.z += sway * 1.8 * uv.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const auroraFragment = /* glsl */ `
${SPIN_SAMPLE}
uniform vec3 uUpColor;
uniform vec3 uDownColor;
uniform vec3 uCoreColor;
uniform float uIntensity;
uniform float uAgeOffset;
uniform float uAgeSpan;
uniform float uSwayPhase;
varying vec2 vUv;
float hash(float x) { return fract(sin(x * 127.1) * 43758.5453); }
void main() {
  // vertical axis = history age: the curtain streams the field's past upward
  float age = uAgeOffset + vUv.y * uAgeSpan;
  float s = spinAt(vUv.x, age);
  // contrast-boost the field so domain walls read as true dark gaps
  float t = pow(min(abs(s), 1.0), 1.6);

  // curtain profile: warm lower border, long fading tail (real aurora shape),
  // undulating reach so the top edge never cuts a straight seam
  float reach = 0.72 + 0.28 * sin(vUv.x * 8.5 + uSwayPhase * 3.1);
  float tail = exp(-vUv.y * (2.0 / reach)) * smoothstep(1.0, 0.72, vUv.y);
  float border = pow(max(1.0 - vUv.y * 2.6, 0.0), 3.0) * 0.55;

  // fine ray striations with per-column jitter
  float colId = floor(vUv.x * 220.0);
  float rays = 0.72 + 0.28 * sin(vUv.x * 260.0 + hash(colId) * 6.2831);

  // soft fade at the curtain's lateral ends
  float ends = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);

  vec3 col = mix(uDownColor, uUpColor, smoothstep(-0.45, 0.45, s));
  col = mix(col, uCoreColor, border * 0.5);

  // the lower border undulates with u (real aurora do); a dead-straight
  // bottom edge reads as a stage riser across the scene
  float cut = 0.03 + 0.09 * (0.5 + 0.5 * sin(vUv.x * 5.3 + uSwayPhase * 1.7))
            + 0.05 * (0.5 + 0.5 * sin(vUv.x * 13.7 + uSwayPhase * 4.3));
  float a = t * (tail * 0.85 + border) * rays * ends * uIntensity
          * smoothstep(cut - 0.03, cut + 0.09, vUv.y);
  gl_FragColor = vec4(col * a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

const CURTAINS = [
  // near, bright, recent field; far layers show older field, dimmer
  { z: -20, y: 4.5, h: 13, ageOffset: 1.0, ageSpan: 22, intensity: 1.05, sway: 0.0 },
  { z: -28, y: 6.0, h: 15, ageOffset: 14.0, ageSpan: 30, intensity: 0.6, sway: 2.1 },
  { z: -38, y: 7.5, h: 18, ageOffset: 34.0, ageSpan: 40, intensity: 0.35, sway: 4.4 },
]

function Aurora({ shared }: { shared: Shared }) {
  const materials = useMemo(
    () =>
      CURTAINS.map(
        (c) =>
          new THREE.ShaderMaterial({
            vertexShader: auroraVertex,
            fragmentShader: auroraFragment,
            uniforms: {
              uSpin: shared.uSpin,
              uHead: shared.uHead,
              uTime: shared.uTime,
              uSwayPhase: { value: c.sway },
              uUpColor: { value: new THREE.Color(UP_COLOR) },
              uDownColor: { value: new THREE.Color(DOWN_COLOR) },
              uCoreColor: { value: new THREE.Color(CORE_COLOR) },
              uIntensity: { value: c.intensity },
              uAgeOffset: { value: c.ageOffset },
              uAgeSpan: { value: c.ageSpan },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
      ),
    [shared]
  )
  const geometries = useMemo(
    () => CURTAINS.map((c) => new THREE.PlaneGeometry(WORLD_SPAN, c.h, 96, 1)),
    []
  )
  return (
    <>
      {CURTAINS.map((c, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          material={materials[i]}
          position={[0, c.y + c.h / 2, c.z]}
        />
      ))}
    </>
  )
}

// ---- ice crystals ----------------------------------------------------------

const iceVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const iceFragment = /* glsl */ `
${SPIN_SAMPLE}
uniform vec3 uBg;
uniform vec3 uUpColor;
uniform vec3 uDownColor;
uniform vec3 uLightDir;
varying vec3 vWorld;
void main() {
  // flat facets from screen-space derivatives (no per-face normals needed)
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 v = normalize(cameraPosition - vWorld);
  if (dot(n, v) < 0.0) n = -n;

  float diff = max(dot(n, uLightDir), 0.0);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float spec = pow(max(dot(n, normalize(uLightDir + v)), 0.0), 64.0);

  // aurora spill: the live field lights up-facing facets by world x.
  // Amber is tamed on ice so crystals stay glacial instead of turning clay.
  float s = spinAt(vWorld.x / ${WORLD_SPAN.toFixed(1)} + 0.5, 3.0);
  vec3 aur = mix(uDownColor * 0.45, uUpColor, smoothstep(-0.4, 0.4, s)) * min(abs(s), 1.0);
  float up = max(n.y, 0.0);

  // dark glass: near-silhouette body, facets picked out by aurora and rim
  vec3 base = mix(vec3(0.006, 0.014, 0.028), vec3(0.028, 0.062, 0.105), diff);
  vec3 color = base
    + aur * up * 0.38
    + aur * fres * 0.34
    + vec3(0.35, 0.55, 0.65) * fres * 0.10
    + vec3(0.7, 0.9, 1.0) * spec * 0.14;

  float dist = distance(cameraPosition, vWorld);
  color = mix(color, uBg, smoothstep(45.0, 95.0, dist));
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

// Irregular crystalline shards: convex hulls over seeded point clouds, a few
// variants instanced many times. Octahedra read as party hats; hulls read as ice.
function shardGeometry(rand: () => number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  const n = 10 + Math.floor(rand() * 6)
  for (let i = 0; i < n; i++) {
    const theta = rand() * Math.PI * 2
    const r = 0.55 + rand() * 0.45
    const y = rand() * 2 - 1
    const rr = r * Math.sqrt(Math.max(0, 1 - y * y * 0.55))
    pts.push(new THREE.Vector3(Math.cos(theta) * rr, y, Math.sin(theta) * rr))
  }
  // guarantee a sharp tip and a grounded base
  pts.push(new THREE.Vector3((rand() - 0.5) * 0.3, 1.35 + rand() * 0.5, (rand() - 0.5) * 0.3))
  pts.push(new THREE.Vector3((rand() - 0.5) * 0.4, -1.2, (rand() - 0.5) * 0.4))
  return new ConvexGeometry(pts)
}

interface IceLayout {
  variant: number
  matrix: THREE.Matrix4
}

function buildIceLayout(variants: number): IceLayout[] {
  // deterministic layout: reduced-motion frames and screenshots stay comparable
  const rand = mulberry32(20260703)
  const dummy = new THREE.Object3D()
  const out: IceLayout[] = []
  const push = () => {
    dummy.updateMatrix()
    out.push({ variant: Math.floor(rand() * variants), matrix: dummy.matrix.clone() })
  }

  // flanking ridges
  for (const side of [-1, 1]) {
    for (let i = 0; i < 55; i++) {
      const u = rand()
      const x = side * (12 + u * 30 + rand() * 4)
      const z = 32 - rand() * 92
      const h = 2 + rand() * (3 + u * 9)
      dummy.position.set(x, h * 0.3, z)
      dummy.scale.set(0.9 + rand() * 2.0, h, 0.9 + rand() * 2.0)
      dummy.rotation.set((rand() - 0.5) * 0.22, rand() * Math.PI, (rand() - 0.5) * 0.22 - side * 0.08)
      push()
    }
    // massive wall shards leaning inward: the cavern's dark frame
    for (let i = 0; i < 7; i++) {
      const x = side * (30 + rand() * 16)
      const z = 18 - rand() * 70
      const h = 12 + rand() * 14
      dummy.position.set(x, h * 0.25, z)
      dummy.scale.set(3.5 + rand() * 3.0, h, 3.5 + rand() * 3.0)
      dummy.rotation.set((rand() - 0.5) * 0.15, rand() * Math.PI, -side * (0.12 + rand() * 0.14))
      push()
    }
  }
  // near-camera dark cluster, left of the start framing (TLOU's dark wall)
  for (let i = 0; i < 6; i++) {
    const x = -8 - rand() * 8
    const z = 10 + rand() * 10
    const h = 5 + rand() * 9
    dummy.position.set(x, h * 0.25, z)
    dummy.scale.set(1.6 + rand() * 1.6, h, 1.6 + rand() * 1.6)
    dummy.rotation.set((rand() - 0.5) * 0.2, rand() * Math.PI, 0.06 + rand() * 0.12)
    push()
  }
  // stalactites
  for (let i = 0; i < 24; i++) {
    const x = (rand() - 0.5) * 68
    if (Math.abs(x) < 5) continue // keep the portrait sightline clear
    const z = -8 - rand() * 44
    dummy.position.set(x, 16 + rand() * 6, z)
    dummy.scale.set(0.7 + rand() * 1.1, -(3 + rand() * 6), 0.7 + rand() * 1.1)
    dummy.rotation.set((rand() - 0.5) * 0.15, rand() * Math.PI, (rand() - 0.5) * 0.15)
    push()
  }
  return out
}

const SHARD_VARIANTS = 4

function IceField({ shared }: { shared: Shared }) {
  const { geometries, material, buckets } = useMemo(() => {
    const grand = mulberry32(8151623)
    const geometries = Array.from({ length: SHARD_VARIANTS }, () => shardGeometry(grand))
    const material = new THREE.ShaderMaterial({
      vertexShader: iceVertex,
      fragmentShader: iceFragment,
      uniforms: {
        uSpin: shared.uSpin,
        uHead: shared.uHead,
        uBg: { value: new THREE.Color(BG) },
        uUpColor: { value: new THREE.Color(UP_COLOR) },
        uDownColor: { value: new THREE.Color(DOWN_COLOR) },
        uLightDir: { value: new THREE.Vector3(-0.3, 0.85, 0.45).normalize() },
      },
      // stalactites use negative y-scale, which reverses winding; the shader
      // flips normals toward the view, so double-sided is safe and correct
      side: THREE.DoubleSide,
    })
    const layout = buildIceLayout(SHARD_VARIANTS)
    const buckets: THREE.Matrix4[][] = Array.from({ length: SHARD_VARIANTS }, () => [])
    for (const item of layout) buckets[item.variant].push(item.matrix)
    return { geometries, material, buckets }
  }, [shared])

  return (
    <>
      {buckets.map((matrices, v) => (
        <instancedMesh
          key={v}
          ref={(m) => {
            if (!m) return
            matrices.forEach((mat, i) => m.setMatrixAt(i, mat))
            m.instanceMatrix.needsUpdate = true
          }}
          args={[geometries[v], material, matrices.length]}
          frustumCulled={false}
        />
      ))}
    </>
  )
}

// ---- floor -----------------------------------------------------------------

const floorVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const floorFragment = /* glsl */ `
${SPIN_SAMPLE}
uniform vec3 uBg;
uniform vec3 uUpColor;
uniform vec3 uDownColor;
varying vec3 vWorld;
void main() {
  vec3 v = normalize(cameraPosition - vWorld);
  float u = vWorld.x / ${WORLD_SPAN.toFixed(1)} + 0.5;
  float s = spinAt(u, 2.0);
  vec3 aur = mix(uDownColor, uUpColor, smoothstep(-0.4, 0.4, s)) * min(abs(s), 1.0);

  // reflection band under the curtains, stronger at grazing angles
  float band = exp(-pow((vWorld.z + 26.0) / 16.0, 2.0));
  float graze = pow(1.0 - clamp(v.y, 0.0, 1.0), 2.0);

  vec3 base = vec3(0.005, 0.011, 0.02);
  vec3 color = base + aur * band * (0.07 + 0.3 * graze);

  // fade to black well before the plane's far edge: caverns have no horizon
  float dist = distance(cameraPosition, vWorld);
  color = mix(color, uBg, smoothstep(28.0, 62.0, dist));
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function Floor({ shared }: { shared: Shared }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: floorVertex,
        fragmentShader: floorFragment,
        uniforms: {
          uSpin: shared.uSpin,
          uHead: shared.uHead,
          uBg: { value: new THREE.Color(BG) },
          uUpColor: { value: new THREE.Color(UP_COLOR) },
          uDownColor: { value: new THREE.Color(DOWN_COLOR) },
        },
      }),
    [shared]
  )
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(240, 170)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return <mesh geometry={geometry} material={material} position={[0, 0, -20]} />
}

// ---- drifting ice motes ----------------------------------------------------

const motesVertex = /* glsl */ `
uniform float uTime;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  p.y = mod(p.y - uTime * (0.15 + aSeed * 0.25), 17.0);
  p.x += sin(uTime * 0.22 + aSeed * 6.2831) * 0.8;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // cap the size and fade motes that drift too near the camera: uncapped
  // points bloom into giant blobs at close range
  gl_PointSize = min((1.5 + aSeed * 2.5) * (140.0 / -mv.z), 7.0);
  float nearFade = clamp((-mv.z - 4.0) / 10.0, 0.0, 1.0);
  vA = (0.16 + aSeed * 0.22) * nearFade;
  gl_Position = projectionMatrix * mv;
}
`

const motesFragment = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d) * vA;
  gl_FragColor = vec4(vec3(0.65, 0.8, 0.9) * a, 1.0);
}
`

function Motes({ shared }: { shared: Shared }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(777)
    const count = 350
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 60
      pos[i * 3 + 1] = rand() * 17
      pos[i * 3 + 2] = 25 - rand() * 70
      seed[i] = rand()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: motesVertex,
      fragmentShader: motesFragment,
      uniforms: { uTime: shared.uTime },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry, material }
  }, [shared])
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

// ---- distant haze at the cavern mouth ---------------------------------------

const glowFragment = /* glsl */ `
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  vec2 q = vUv - vec2(0.5, 0.42);
  q.x *= 2.2;
  // asymmetric: haze rises above the aurora, but the cave below it stays black
  q.y *= q.y < 0.0 ? 3.4 : 1.2;
  float g = exp(-dot(q, q) * 9.0);
  gl_FragColor = vec4(uColor * g * 0.4, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function MouthGlow() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: glowFragment,
        uniforms: { uColor: { value: new THREE.Color('#123a4a') } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  )
  return (
    <mesh material={material} position={[0, 24, -70]}>
      <planeGeometry args={[220, 80]} />
    </mesh>
  )
}

// ---- world root --------------------------------------------------------------

export function FrozenDeep({ frozen }: { frozen: boolean }) {
  const feed = useMemo(
    () => createSimFeed(frozen, resolveVisitSeed(location.search)),
    [frozen]
  )
  const shared = useMemo<Shared>(
    () => ({
      uSpin: { value: feed.texture },
      uHead: { value: feed.head() },
      uTime: { value: 0 },
    }),
    [feed]
  )

  useFrame((_, delta) => {
    if (frozen) return
    feed.tick(delta)
    shared.uHead.value = feed.head()
    shared.uTime.value += delta
  })

  return (
    <>
      <color attach="background" args={[BG]} />
      <MouthGlow />
      <Aurora shared={shared} />
      <IceField shared={shared} />
      <Floor shared={shared} />
      <Motes shared={shared} />
    </>
  )
}
