// The neutral character-select vista: a sunset fantasy valley the visitor lands
// in before equipping a job. Assets are Rodin-generated glTF props (foundry:
// Blender); everything else — terrain, water, sunset light, haze — is built here
// so it reads at final quality and comes alive. Terrain is recreated from the
// floorH heightfield rather than a baked mesh. Blender-space coords (x, y) map
// to R3F as (x, floorH, -y): Blender +y "into scene" is R3F -z.
import { useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { mulberry32 } from '../../sim/gpe'
import { floorH, waterZ, channelX, slope } from './vistaFloor'
import { TREES, ROCKS, BACKGROUND, FLOATERS, LILIES, BRIDGES, type Placed } from './vistaPlacement'

const ASSETS = [
  'oak', 'broadleaf', 'bushtree', 'willow', 'maple', 'pine', 'birch',
  'mossy-rock', 'cairn', 'rock-cluster', 'spire', 'pillar',
  'flowers', 'grass-tuft', 'fern', 'lily', 'bridge', 'arch', 'island', 'mountain',
] as const
const URLS = ASSETS.map((a) => `/vista/props/${a}.glb`)
URLS.forEach((u) => useGLTF.preload(u))

// Blender (x,y) + height -> R3F position. yAbs overrides ground-following.
function pos(p: Placed): [number, number, number] {
  const h = p.yAbs !== undefined ? p.yAbs : floorH(p.x, p.y)
  return [p.x, h, -p.y]
}

function Prop({ scene, p }: { scene: THREE.Group; p: Placed }) {
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return c
  }, [scene])
  return (
    <primitive
      object={clone}
      position={pos(p)}
      rotation={[p.rx ?? 0, p.rz ?? 0, 0]}
      scale={p.s}
    />
  )
}

// procedural ground detail (ferns, grass, wildflowers): bank-following clumps +
// meadow patches. Regenerated here so density is tunable without touching data.
function useGroundDetail(): Placed[] {
  return useMemo(() => {
    const rand = mulberry32(11)
    const out: Placed[] = []
    const detail = ['fern', 'grass-tuft', 'flowers']
    const base: Record<string, number> = { fern: 0.9, 'grass-tuft': 0.85, flowers: 0.9 }
    for (let y = 6; y < 48; y += 5) {
      for (const side of [-1, 1]) {
        if (rand() < 0.35) continue
        const bx = channelX(y) + side * (4.6 + rand() * 2.2)
        const n = 1 + Math.floor(rand() * 3)
        for (let k = 0; k < n; k++) {
          const a = detail[Math.floor(rand() * 3)]
          out.push({ asset: a, x: bx + (rand() - 0.5) * 2.4, y: y + (rand() - 0.5) * 3, s: base[a] * (0.7 + rand() * 0.55), rz: rand() * 6.28 })
        }
      }
    }
    for (const [cx0, cy] of [[-10, 19], [12, 44]] as const) {
      for (let k = 0; k < 6; k++) {
        out.push({ asset: 'flowers', x: cx0 + (rand() - 0.5) * 5, y: cy + (rand() - 0.5) * 5, s: 0.7 + rand() * 0.4, rz: rand() * 6.28 })
      }
    }
    for (const [tx, ty] of [[-13, 6], [14, 8], [16, 22], [-15, 24], [6.6, 30]] as const) {
      const n = 1 + Math.floor(rand() * 2)
      for (let k = 0; k < n; k++) {
        const ang = rand() * 6.28
        const r = 1.5 + rand() * 1.1
        out.push({ asset: rand() < 0.5 ? 'fern' : 'grass-tuft', x: tx + Math.cos(ang) * r, y: ty + Math.sin(ang) * r, s: 0.8 * (0.8 + rand() * 0.4), rz: rand() * 6.28 })
      }
    }
    return out
  }, [])
}

function Terrain() {
  const geom = useMemo(() => {
    // extends well past the fog distance in every direction so the edges haze
    // into the sky (a real horizon) instead of reading as a floating tile; near
    // edge sits in front of / below the camera to fill the foreground
    const X0 = -300, X1 = 300, Y0 = -70, Y1 = 320
    const nx = 240, ny = 240
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array((nx + 1) * (ny + 1) * 3)
    const col = new Float32Array((nx + 1) * (ny + 1) * 3)
    const grass = new THREE.Color('#7a9a40')
    const grassDry = new THREE.Color('#95964a')
    const rock = new THREE.Color('#9c8460')
    const c = new THREE.Color()
    let i = 0
    for (let iy = 0; iy <= ny; iy++) {
      const by = Y0 + ((Y1 - Y0) * iy) / ny
      for (let ix = 0; ix <= nx; ix++) {
        const x = X0 + ((X1 - X0) * ix) / nx
        const h = floorH(x, by)
        pos[i * 3] = x; pos[i * 3 + 1] = h; pos[i * 3 + 2] = -by
        const sl = slope(x, by)
        c.copy(grass).lerp(grassDry, THREE.MathUtils.clamp((by - 10) / 60, 0, 0.6))
        c.lerp(rock, THREE.MathUtils.smoothstep(sl, 0.28, 0.62))
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
        i++
      }
    }
    const idx: number[] = []
    const w = nx + 1
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const a = iy * w + ix, b = a + 1, d = a + w, e = d + 1
        idx.push(a, b, d, b, e, d) // CCW from above -> upward normals
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  )
}

function Water() {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const Y0 = -8, Y1 = 52, steps = 60, half = 3.15
    const pos = new Float32Array((steps + 1) * 2 * 3)
    const uv = new Float32Array((steps + 1) * 2 * 2)
    let i = 0
    for (let s = 0; s <= steps; s++) {
      const by = Y0 + ((Y1 - Y0) * s) / steps
      const cx = channelX(by), z = waterZ(by)
      for (const side of [-1, 1]) {
        pos[i * 3] = cx + side * half; pos[i * 3 + 1] = z; pos[i * 3 + 2] = -by
        uv[i * 2] = (side + 1) / 2; uv[i * 2 + 1] = s / steps
        i++
      }
    }
    const idx: number[] = []
    for (let s = 0; s < steps; s++) {
      const a = s * 2, b = a + 1, c = a + 2, d = a + 3
      idx.push(a, b, c, b, d, c) // upward-facing water surface
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#3fb6c8" transparent opacity={0.82} roughness={0.15} metalness={0.2} />
    </mesh>
  )
}

// warm sunset gradient dome (horizon peach -> zenith lilac), painted behind fog
function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color('#b7a6d6') },
          mid: { value: new THREE.Color('#f2b48a') },
          bot: { value: new THREE.Color('#f7d9a8') },
        },
        vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
          void main(){ float h=clamp(normalize(vP).y*0.5+0.5,0.0,1.0);
            vec3 c = h<0.5 ? mix(bot,mid,h*2.0) : mix(mid,top,(h-0.5)*2.0);
            gl_FragColor=vec4(c,1.0);}`,
      }),
    [],
  )
  return (
    <mesh scale={400} material={mat}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  )
}

export function VistaWorld({ frozen }: { frozen: boolean; up: string; down: string }) {
  const gltfs = useGLTF(URLS) as unknown as Array<{ scene: THREE.Group }>
  const byKey = useMemo(() => {
    const m = new Map<string, THREE.Group>()
    ASSETS.forEach((a, i) => m.set(a, gltfs[i].scene))
    return m
  }, [gltfs])
  const detail = useGroundDetail()
  const sun = useRef<THREE.DirectionalLight>(null!)
  const invalidate = useThree((s) => s.invalidate)
  if (frozen) invalidate()

  const all = useMemo(
    () => [...BACKGROUND, ...FLOATERS, ...TREES, ...ROCKS, ...BRIDGES, ...LILIES, ...detail],
    [detail],
  )

  return (
    <>
      <fogExp2 attach="fog" args={['#eec49a', 0.0026]} />
      <SkyDome />
      <hemisphereLight args={['#ffe9c8', '#4a5a2e', 0.35]} />
      <ambientLight intensity={0.16} color="#ffd9b0" />
      <directionalLight
        ref={sun}
        castShadow
        position={[42, 40, -8]}
        intensity={2.6}
        color="#ffdca0"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={40}
        shadow-camera-bottom={-70}
      />
      <Terrain />
      <Water />
      {all.map((p, i) => {
        const s = byKey.get(p.asset)
        return s ? <Prop key={i} scene={s} p={p} /> : null
      })}
    </>
  )
}
