// The summoner's sanctum: the AI Systems world. Agent orchestration IS
// summoning and dispatching familiars, so the world stages that literally: a
// glowing summoning circle, sigils ringed around it, and familiars (wisps)
// that spawn at the center, fly out to a sigil, work, and return. The sigils
// are abstract glyphs, not text -- the real capability names live in the DOM
// skill tree (a11y floor: real DOM text, never texture-baked).
import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../../sim/gpe'

const BG = '#07050f'

interface Shared {
  uTime: { value: number }
  uAccent: { value: THREE.Color }
  uAccent2: { value: THREE.Color }
}

// ---- summoning circle (floor) ----------------------------------------------

const circleFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uAccent2;
varying vec2 vUv;
#define PI 3.14159265

float ring(float r, float target, float w) {
  return smoothstep(w, 0.0, abs(r - target));
}
// runic tick marks around a ring: bright where angle hits a slot
float ticks(float ang, float count, float duty) {
  float a = fract(ang / (2.0 * PI) * count);
  return smoothstep(duty, duty * 0.5, abs(a - 0.5));
}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float ang = atan(p.y, p.x);
  if (r > 1.0) discard;

  float glow = 0.0;
  // three concentric rings, the middle one counter-rotating via tick phase
  glow += ring(r, 0.94, 0.012) * 0.9;
  glow += ring(r, 0.62, 0.02) * (0.5 + 0.5 * ticks(ang + uTime * 0.2, 48.0, 0.4));
  glow += ring(r, 0.40, 0.03) * (0.5 + 0.5 * ticks(ang - uTime * 0.35, 12.0, 0.3));
  glow += ring(r, 0.15, 0.05) * 0.7;
  // thin radial spokes between the 0.40 and 0.62 rings (bounded so no spoke
  // beams off toward the camera)
  float spoke = ticks(ang, 6.0, 0.02) * ring(r, 0.51, 0.11);
  glow += spoke * 0.5;

  // central charge pulse
  float core = exp(-r * r * 8.0) * (0.6 + 0.4 * sin(uTime * 1.5));
  vec3 col = mix(uAccent2, uAccent, smoothstep(0.0, 0.9, r)) * glow + uAccent * core;

  // gentle breathing
  col *= 0.8 + 0.2 * sin(uTime * 0.8);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function SummoningCircle({ shared }: { shared: Shared }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: circleFrag,
        uniforms: { uTime: shared.uTime, uAccent: shared.uAccent, uAccent2: shared.uAccent2 },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [shared]
  )
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(34, 34)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return <mesh geometry={geo} material={material} position={[0, 0.02, -12]} />
}

// ---- floor haze ------------------------------------------------------------

function Floor({ shared }: { shared: Shared }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vW; void main(){ vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: /* glsl */ `
          uniform vec3 uBg; uniform vec3 uAccent; varying vec3 vW;
          void main(){
            float d = length(vW.xz - vec2(0.0,-12.0));
            float halo = exp(-d*d*0.004);
            vec3 col = mix(uBg, uBg + uAccent*0.12, halo);
            float fog = smoothstep(38.0, 90.0, distance(cameraPosition, vW));
            col = mix(col, uBg, fog);
            gl_FragColor = vec4(col,1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        uniforms: { uBg: { value: new THREE.Color(BG) }, uAccent: shared.uAccent },
      }),
    [shared]
  )
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(220, 220)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return <mesh geometry={geo} material={material} position={[0, 0, -12]} />
}

// ---- sigils (abstract glyph plates orbiting the circle) --------------------

const sigilFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uAccent2;
uniform float uSeed;
uniform float uPhase;
varying vec2 vUv;
#define PI 3.14159265
float rand(float n){ return fract(sin(n*127.1+uSeed)*43758.5453); }
void main(){
  vec2 p = vUv*2.0-1.0;
  float r = length(p);
  float ang = atan(p.y,p.x);
  float a = 0.0;
  // hexagram frame: two triangles (six-pointed rune boundary)
  float hex = cos(floor(0.5 + ang/(PI/3.0)) * (PI/3.0) - ang) * r;
  a += smoothstep(0.03, 0.0, abs(hex - 0.86)) * 0.9;
  a += smoothstep(0.02, 0.0, abs(r - 0.62)) * 0.5;
  // a procedural glyph: rotating spoke-arcs unique per seed (NOT text)
  for(int i=0;i<5;i++){
    float fi=float(i);
    float base=rand(fi)*PI*2.0;
    float sp=(rand(fi+9.0)-0.5)*0.5;
    float target=0.18+0.42*rand(fi+3.0);
    float arc=smoothstep(0.045,0.0,abs(r-target));
    float seg=smoothstep(0.62,0.5,abs(fract((ang+base+uTime*sp)/PI)-0.5));
    a+=arc*seg*0.9;
  }
  // radial ticks around the rim
  a += smoothstep(0.05,0.0,abs(r-0.86)) * (0.5+0.5*sin(ang*12.0)) * 0.5;
  // center rune dot
  a += exp(-r*r*20.0)*0.9;
  if(hex>0.95) discard;
  float pulse = 0.65 + 0.35*sin(uTime*1.6 + uPhase);
  vec3 col = mix(uAccent2, uAccent, 0.4+0.6*r) * a * pulse * 1.3;
  gl_FragColor = vec4(col, clamp(a,0.0,1.0));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

const SIGILS = 6

function Sigils({ shared }: { shared: Shared }) {
  const items = useMemo(() => {
    const rand = mulberry32(31337)
    return Array.from({ length: SIGILS }, (_, i) => {
      const ang = (i / SIGILS) * Math.PI * 2 + 0.4
      const rad = 11.5
      return {
        pos: [Math.cos(ang) * rad, 4.4 + Math.sin(i * 1.7) * 1.8, -12 + Math.sin(ang) * rad] as [number, number, number],
        seed: rand() * 10,
        phase: rand() * 6.28,
        material: new THREE.ShaderMaterial({
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
          fragmentShader: sigilFrag,
          uniforms: {
            uTime: shared.uTime,
            uAccent: shared.uAccent,
            uAccent2: shared.uAccent2,
            uSeed: { value: rand() * 100 },
            uPhase: { value: rand() * 6.28 },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      }
    })
  }, [shared])
  const geo = useMemo(() => new THREE.PlaneGeometry(3.4, 3.4), [])

  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} geometry={geo} material={it.material} position={it.pos} />
      ))}
    </>
  )
}

// ---- familiars (wisps dispatched from the circle to the sigils) ------------

const NUM_FAMILIARS = 40

const familiarVert = /* glsl */ `
uniform float uTime;
attribute float aSeed;
attribute vec3 aTarget;
varying float vGlow;
void main(){
  // each familiar cycles: rise from center, arc to its sigil, return
  float t = fract(uTime * (0.06 + aSeed * 0.05) + aSeed);
  // ease out then in
  float k = t < 0.5 ? (t*2.0) : (2.0 - t*2.0);
  k = k*k*(3.0-2.0*k);
  vec3 center = vec3(0.0, 0.6, -12.0);
  vec3 pos = mix(center, aTarget, k);
  // arc height
  pos.y += sin(k * 3.14159) * (2.5 + aSeed * 2.0);
  // little orbit jitter
  pos.x += sin(uTime * 2.0 + aSeed * 6.28) * 0.25;
  pos.z += cos(uTime * 1.7 + aSeed * 6.28) * 0.25;
  vGlow = 0.5 + 0.5 * sin(t * 3.14159);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (5.0 + aSeed * 6.0) * (120.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const familiarFrag = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uAccent2;
varying float vGlow;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uAccent2, uAccent, vGlow);
  gl_FragColor = vec4(col * a * (0.5 + vGlow), a * (0.4 + 0.5*vGlow));
}
`

function Familiars({ shared }: { shared: Shared }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(9001)
    const pos = new Float32Array(NUM_FAMILIARS * 3)
    const seed = new Float32Array(NUM_FAMILIARS)
    const target = new Float32Array(NUM_FAMILIARS * 3)
    for (let i = 0; i < NUM_FAMILIARS; i++) {
      const s = i % SIGILS
      const ang = (s / SIGILS) * Math.PI * 2 + 0.4
      const rad = 9.5
      target[i * 3] = Math.cos(ang) * rad
      target[i * 3 + 1] = 3.2 + Math.sin(s * 1.7) * 1.4
      target[i * 3 + 2] = -12 + Math.sin(ang) * rad
      seed[i] = rand()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geometry.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    const material = new THREE.ShaderMaterial({
      vertexShader: familiarVert,
      fragmentShader: familiarFrag,
      uniforms: { uTime: shared.uTime, uAccent: shared.uAccent, uAccent2: shared.uAccent2 },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry, material }
  }, [shared])
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

// ---- rising arcane motes ---------------------------------------------------

function Embers({ shared }: { shared: Shared }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(4242)
    const count = 260
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 40
      pos[i * 3 + 1] = rand() * 20
      pos[i * 3 + 2] = -12 + (rand() - 0.5) * 40
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
          p.y = mod(p.y + uTime * (0.3 + aSeed*0.4), 20.0);
          p.x += sin(uTime*0.3 + aSeed*6.28)*0.6;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          gl_PointSize = min((1.0+aSeed*2.0)*(120.0/-mv.z), 5.0);
          vA = (0.1+aSeed*0.2) * clamp((-mv.z-3.0)/12.0,0.0,1.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uAccent; varying float vA;
        void main(){ float d=length(gl_PointCoord-0.5); gl_FragColor=vec4(uAccent*smoothstep(0.5,0.0,d)*vA, 1.0); }`,
      uniforms: { uTime: shared.uTime, uAccent: shared.uAccent },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry, material }
  }, [shared])
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

// ---- world root ------------------------------------------------------------

export function Sanctum({ frozen, up, down }: { frozen: boolean; up: string; down: string }) {
  const shared = useMemo<Shared>(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(up) },
      uAccent2: { value: new THREE.Color(down) },
    }),
    // colors re-lit below; created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const target = useMemo(() => ({ up: new THREE.Color(up), down: new THREE.Color(down) }), [up, down])
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    shared.uAccent.value.copy(target.up)
    shared.uAccent2.value.copy(target.down)
    if (frozen) invalidate()
  }, [target, frozen, shared, invalidate])

  useFrame((_, delta) => {
    if (frozen) {
      // hold a representative pose so reduced-motion has a formed scene
      if (shared.uTime.value === 0) shared.uTime.value = 3.2
      return
    }
    shared.uTime.value += delta
  })

  return (
    <>
      <color attach="background" args={[BG]} />
      <Floor shared={shared} />
      <SummoningCircle shared={shared} />
      <Sigils shared={shared} />
      <Familiars shared={shared} />
      <Embers shared={shared} />
    </>
  )
}
