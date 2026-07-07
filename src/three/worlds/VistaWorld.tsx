// The neutral character-select vista: a sunset fantasy valley the visitor lands
// in before equipping a job. Assets are Rodin-generated glTF props (foundry:
// Blender); everything else — terrain, water, sunset light, haze — is built here
// so it reads at final quality and comes alive. Terrain is recreated from the
// floorH heightfield rather than a baked mesh. Blender-space coords (x, y) map
// to R3F as (x, floorH, -y): Blender +y "into scene" is R3F -z.
import { useMemo, useRef } from 'react'
import { useThree, useFrame, useLoader } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { mulberry32 } from '../../sim/gpe'
import { floorH, waterZ, channelX, channelHalf, slope } from './vistaFloor'
import { TREES, ROCKS, BACKGROUND, FLOATERS, LILIES, BRIDGES, type Placed } from './vistaPlacement'

const ASSETS = [
  'oak', 'broadleaf', 'bushtree', 'willow', 'maple', 'pine', 'birch', 'poplar', 'oldtree',
  'mossy-rock', 'cairn', 'rock-cluster', 'spire', 'pillar',
  'flowers', 'grass-tuft', 'fern', 'lily', 'bridge', 'arch',
  'island', 'island2', 'island3', 'mountain', 'mountain2',
] as const
const URLS = ASSETS.map((a) => `/vista/props/${a}.glb`)
URLS.forEach((u) => useGLTF.preload(u))

// Sunset key direction (points from the valley toward the sun: up, right, and
// back into the scene so it sits upper-right of frame and backlights the props).
// Shared by the directional light, the sun disc, and the sky hotspot so they agree.
const SUN_DIR = new THREE.Vector3(0.55, 0.5, -0.67).normalize()

// Shared wind clock: one value driven by VistaWorld's useFrame (paused when
// frozen), read by every foliage material and the grass so the scene breathes
// together. Each vertex phases by its own world position, so nothing marches.
const windTime = { value: 0 }

// Inject a gentle breeze sway into a MeshStandard material's vertex stage.
// `heightExpr` gives the 0..1 "how much this vertex sways" factor (tips move,
// bases stay planted); it differs for centre-pivoted props vs base-pivoted grass.
function injectWind(shader: { uniforms: Record<string, THREE.IUniform>; vertexShader: string }, heightExpr: string, amp: number, extraAttr = '') {
  shader.uniforms.uWind = windTime
  shader.vertexShader =
    `uniform float uWind;\n${extraAttr}\n` +
    shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       {
         vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
         float ph = wp.x * 0.16 + wp.z * 0.13;
         float f = ${heightExpr};
         transformed.x += sin(uWind * 1.3 + ph) * f * ${amp.toFixed(3)};
         transformed.z += cos(uWind * 1.05 + ph * 0.8) * f * ${amp.toFixed(3)};
       }`,
    )
}

// centre-pivoted foliage (glTF props): only the upper canopy sways
function foliageWind(mat: THREE.Material) {
  const m = mat as THREE.MeshStandardMaterial
  m.onBeforeCompile = (s) => injectWind(s, 'pow(clamp(transformed.y * 0.55 + 0.5, 0.0, 1.0), 2.0)', 0.05)
  m.needsUpdate = true
}
const FOLIAGE = new Set(['oak', 'broadleaf', 'bushtree', 'willow', 'maple', 'pine', 'birch', 'poplar', 'oldtree', 'fern', 'grass-tuft', 'flowers'])

function Prop({ scene, p }: { scene: THREE.Group; p: Placed }) {
  const clone = useMemo(() => {
    const c = scene.clone(true)
    // Only near, grounded props cast/receive shadows. Mountains, floating
    // islands and the far tree-line are distant/hazed and outside the shadow
    // frustum anyway — shadowing them just burns the shadow pass (dropped fps
    // below the floor). This is the main perf lever for the vista.
    const shadows = p.yAbs === undefined && p.asset !== 'mountain' && p.y < 50
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = shadows
        o.receiveShadow = shadows
      }
    })
    return c
  }, [scene, p])
  // Rodin assets are pivoted at their CENTER, so placing the pivot at ground
  // level buries the bottom half (no trunk, bridge underwater). Measure the
  // scaled+rotated world bbox and lift so its BASE sits on the target surface
  // (terrain, or the water for bridges/lilies). Floaters keep an absolute y.
  const position = useMemo<[number, number, number]>(() => {
    if (p.yAbs !== undefined) return [p.x, p.yAbs, -p.y]
    clone.position.set(p.x, 0, -p.y)
    clone.rotation.set(p.rx ?? 0, p.rz ?? 0, 0)
    clone.scale.setScalar(p.s)
    clone.updateMatrixWorld(true)
    const minY = new THREE.Box3().setFromObject(clone).min.y
    const ground = p.on === 'water' ? waterZ(p.y) : floorH(p.x, p.y)
    return [p.x, ground - minY + (p.lift ?? 0), -p.y]
  }, [clone, p])
  return (
    <primitive
      object={clone}
      position={position}
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
    // denser bank foliage: closer spacing, more clumps per cell, wider spread up
    // the banks so the ground reads full rather than bare between assets
    for (let y = 5; y < 50; y += 3.5) {
      for (const side of [-1, 1]) {
        if (rand() < 0.18) continue
        const bx = channelX(y) + side * (4.4 + rand() * 6)
        const n = 2 + Math.floor(rand() * 3)
        for (let k = 0; k < n; k++) {
          const a = detail[Math.floor(rand() * 3)]
          out.push({ asset: a, x: bx + (rand() - 0.5) * 3, y: y + (rand() - 0.5) * 3.2, s: base[a] * (0.7 + rand() * 0.55), rz: rand() * 6.28 })
        }
      }
    }
    for (const [cx0, cy] of [[-10, 19], [12, 44], [-16, 34], [16, 12]] as const) {
      for (let k = 0; k < 7; k++) {
        out.push({ asset: 'flowers', x: cx0 + (rand() - 0.5) * 6, y: cy + (rand() - 0.5) * 6, s: 0.7 + rand() * 0.4, rz: rand() * 6.28 })
      }
    }
    // subtle detail clustered around the arch's midground base so it isn't bare
    for (const [ax, ay] of [[-8, 58], [10, 60], [-2, 54], [6, 64], [-12, 62], [13, 56]] as const) {
      const a = detail[Math.floor(rand() * 3)]
      out.push({ asset: a, x: ax + (rand() - 0.5) * 3, y: ay + (rand() - 0.5) * 3, s: base[a] * (0.7 + rand() * 0.5), rz: rand() * 6.28 })
      out.push({ asset: rand() < 0.5 ? 'mossy-rock' : 'cairn', x: ax + (rand() - 0.5) * 4, y: ay + (rand() - 0.5) * 3, s: 0.22 + rand() * 0.3, rz: rand() * 6.28 })
    }
    // tiny scattered rocks & pebbles for fine ground detail (small scale, static)
    for (let y = 4; y < 50; y += 2.6) {
      for (const side of [-1, 1]) {
        if (rand() < 0.55) continue
        const rx = channelX(y) + side * (3.8 + rand() * 11)
        const a = rand() < 0.5 ? 'mossy-rock' : 'rock-cluster'
        out.push({ asset: a, x: rx + (rand() - 0.5) * 3, y: y + (rand() - 0.5) * 3, s: 0.16 + rand() * 0.26, rz: rand() * 6.28 })
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

const TILE = 0.14 // texture repeats per metre (~7m per tile)

function Terrain() {
  const [diff, nor] = useLoader(THREE.TextureLoader, [
    '/vista/textures/aerial_grass_rock_diff_1k.jpg',
    '/vista/textures/aerial_grass_rock_nor_gl_1k.jpg',
  ])
  useMemo(() => {
    for (const t of [diff, nor]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = 8
    }
    diff.colorSpace = THREE.SRGBColorSpace // nor stays linear
  }, [diff, nor])
  const geom = useMemo(() => {
    // extends well past the fog distance in every direction so the edges haze
    // into the sky (a real horizon) instead of reading as a floating tile; near
    // edge sits in front of / below the camera to fill the foreground
    const X0 = -300, X1 = 300, Y0 = -70, Y1 = 320
    const nx = 220, ny = 220
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array((nx + 1) * (ny + 1) * 3)
    const uv = new Float32Array((nx + 1) * (ny + 1) * 2)
    const col = new Float32Array((nx + 1) * (ny + 1) * 3)
    // light tints: they multiply the grass photo to bias hue per zone (green
    // flats / dry mid-ground / stony steep faces) without darkening the detail
    const grass = new THREE.Color('#7fc23a')
    const grassDry = new THREE.Color('#b7bd5a')
    const rock = new THREE.Color('#c3ad8a')
    const shoreGreen = new THREE.Color('#5f9a34') // lush mossy bank at the waterline
    const c = new THREE.Color()
    let i = 0
    for (let iy = 0; iy <= ny; iy++) {
      const by = Y0 + ((Y1 - Y0) * iy) / ny
      for (let ix = 0; ix <= nx; ix++) {
        const x = X0 + ((X1 - X0) * ix) / nx
        const h = floorH(x, by)
        pos[i * 3] = x; pos[i * 3 + 1] = h; pos[i * 3 + 2] = -by
        uv[i * 2] = x * TILE; uv[i * 2 + 1] = by * TILE
        const sl = slope(x, by)
        c.copy(grass).lerp(grassDry, THREE.MathUtils.clamp((by - 10) / 60, 0, 0.32))
        // dirt/rock only on true cliffs — channel banks (slope ~0.5) stay green
        // to the waterline instead of reading as bare canyon walls
        c.lerp(rock, THREE.MathUtils.smoothstep(sl, 0.72, 0.95))
        // lush mossy shoreline: within ~5.5m of the water pull back to green so
        // the banks never read as bare mud at the waterline
        const ad = Math.abs(x - channelX(by))
        const shoreT = 1 - THREE.MathUtils.smoothstep(ad, channelHalf(by), channelHalf(by) + 5.5)
        c.lerp(shoreGreen, shoreT * 0.7)
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
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial
        map={diff}
        normalMap={nor}
        normalScale={new THREE.Vector2(0.8, 0.8)}
        vertexColors
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  )
}

// Stylised river. The ribbon follows the meandering channelX so the water winds
// with the valley. A custom shader flows DOWNSTREAM (normal detail scrolls along
// the river's length, v), fakes a sky+sun reflection via fresnel (cheap, no
// planar render), and blends into the banks with a shallow-water edge + foam
// shoreline + soft alpha so there's no hard waterline. Driven by the shared
// windTime, so it's automatically still under reduced motion.
function Water() {
  const normals = useLoader(THREE.TextureLoader, '/vista/textures/waternormals.jpg')
  const { geom, mat } = useMemo(() => {
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping
    const Y0 = -14, Y1 = 54, steps = 84
    const pos: number[] = [], uv: number[] = [], idx: number[] = []
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, by = Y0 + (Y1 - Y0) * t, cx = channelX(by), z = waterZ(by)
      const half = channelHalf(by) - 0.1 // edge just inside the bank: keeps the smooth
      // ribbon geometry (lapping further out clips jaggedly against the coarse terrain
      // grid) while sitting close enough that the wide soft alpha fade + foam dissolve
      // it into the bank instead of floating proud of the bed
      // offset each edge PERPENDICULAR to the centreline tangent, not along
      // world-X — otherwise the ribbon folds/notches on the meander's bends
      const e = 0.5
      const dcx = (channelX(by + e) - channelX(by - e)) / (2 * e)
      const L = Math.hypot(1, dcx)
      const px = 1 / L, pz = dcx / L
      for (const side of [-1, 1]) {
        pos.push(cx + side * half * px, z, -by + side * half * pz)
        uv.push((side + 1) / 2, t)
      }
    }
    for (let s = 0; s < steps; s++) {
      const a = s * 2, b = a + 1, c = a + 2, d = a + 3
      idx.push(a, b, c, b, d, c)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: windTime,
        uNormals: { value: normals },
        uSun: { value: SUN_DIR },
        uDeep: { value: new THREE.Color('#0a5670') },
        uShallow: { value: new THREE.Color('#3aa8b6') },
        uGlow: { value: new THREE.Color('#fff2d6') },
        uFog: { value: new THREE.Color('#f2c39a') },
      },
      vertexShader: `varying vec2 vUv; varying vec3 vW; varying float vDepth;
        void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz;
          vec4 mv=viewMatrix*w; vDepth=-mv.z; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform float uTime; uniform sampler2D uNormals; uniform vec3 uSun,uDeep,uShallow,uGlow,uFog;
        varying vec2 vUv; varying vec3 vW; varying float vDepth;
        const vec3 SKY_TOP=vec3(0.663,0.635,0.816);
        const vec3 SKY_MID=vec3(0.957,0.710,0.549);
        const vec3 SKY_BOT=vec3(1.0,0.847,0.678);
        void main(){
          // downstream flow: normal detail scrolls along v (the river's length)
          vec3 t1 = texture2D(uNormals, vec2(vUv.x*3.0, vUv.y*9.0 - uTime*0.09)).xyz*2.0-1.0;
          vec3 t2 = texture2D(uNormals, vec2(vUv.x*5.0+0.3, vUv.y*15.0 - uTime*0.15)).xyz*2.0-1.0;
          vec3 N = normalize(vec3((t1.x+t2.x)*0.35, 1.0, (t1.y+t2.y)*0.35));
          vec3 V = normalize(cameraPosition - vW);
          vec3 R = reflect(-V, N);
          float hy = clamp(R.y*0.5+0.5,0.0,1.0);
          vec3 sky = hy<0.5 ? mix(SKY_BOT,SKY_MID,hy*2.0) : mix(SKY_MID,SKY_TOP,(hy-0.5)*2.0);
          sky += uGlow * pow(max(dot(R,uSun),0.0), 60.0) * 1.6;
          float fres = 0.02 + 0.42*pow(1.0 - max(dot(V,N),0.0), 5.0);
          float shore = smoothstep(0.0,0.34,vUv.x)*smoothstep(1.0,0.66,vUv.x);
          vec3 col = mix(mix(uShallow,uDeep,shore), sky, fres);
          vec3 H = normalize(V + uSun);
          col += uGlow * pow(max(dot(N,H),0.0), 130.0) * 1.3;
          // foam shoreline, broken up by the ripple texture -> clean blend to bank
          float foamTex = texture2D(uNormals, vec2(vUv.x*6.0, vUv.y*20.0 - uTime*0.2)).r;
          float foam = smoothstep(0.6,1.0,1.0-shore) * smoothstep(0.35,0.7,foamTex);
          col = mix(col, vec3(0.96,0.98,1.0), foam*0.6);
          float fog = 1.0 - exp(-0.000064*vDepth*vDepth); // matches fogExp2 0.008
          col = mix(col, uFog, clamp(fog,0.0,1.0));
          float edgeA = smoothstep(0.0,0.14,vUv.x)*smoothstep(1.0,0.86,vUv.x);
          float endA = smoothstep(0.0,0.03,vUv.y)*smoothstep(1.0,0.92,vUv.y);
          gl_FragColor = vec4(col, clamp(0.9*edgeA*endA + foam*0.4, 0.0, 0.96));
        }`,
    })
    return { geom: g, mat: m }
  }, [normals])
  return <mesh geometry={geom} material={mat} />
}

// Dense wind-swayed grass: thousands of little 3-blade tufts in a single
// InstancedMesh, scattered thick on the banks (out of the water, off the
// cliffs, denser near the camera). This is what fills the empty ground and,
// with the shared wind, brings the foreground to life. ~5k tufts = 1 draw call.
function GrassField() {
  const geomMat = useMemo(() => {
    const base = new THREE.Color('#3f6b28')
    const tip = new THREE.Color('#a8d05e')
    const bw = 0.09, tw = 0.012, h = 0.55, bend = 0.13
    const pos: number[] = [], col: number[] = [], aH: number[] = [], idx: number[] = []
    let v = 0
    for (const ang of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
      const c = Math.cos(ang), s = Math.sin(ang)
      const rot = (x: number, z: number): [number, number] => [x * c - z * s, x * s + z * c]
      const quad = [rot(-bw / 2, 0), rot(bw / 2, 0), rot(-tw / 2, bend), rot(tw / 2, bend)]
      const ys = [0, 0, h, h], ts = [0, 0, 1, 1]
      for (let k = 0; k < 4; k++) {
        pos.push(quad[k][0], ys[k], quad[k][1])
        aH.push(ts[k])
        const c2 = base.clone().lerp(tip, ts[k])
        col.push(c2.r, c2.g, c2.b)
      }
      idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3)
      v += 4
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    g.setAttribute('aH', new THREE.Float32BufferAttribute(aH, 1))
    g.setIndex(idx)
    g.computeVertexNormals()
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, side: THREE.DoubleSide })
    m.onBeforeCompile = (s) => injectWind(s, 'aH * aH', 0.16, 'attribute float aH;')
    return { g, m }
  }, [])

  const mesh = useMemo(() => {
    const rand = mulberry32(7)
    const placed: { x: number; y: number; s: number; hy: number; r: number }[] = []
    let attempts = 0
    while (placed.length < 11000 && attempts < 200000) {
      attempts++
      const bx = -44 + rand() * 88
      const by = -14 + rand() * 106
      const ad = Math.abs(bx - channelX(by))
      if (ad < channelHalf(by) + 0.2) continue // out of the water/pool
      if (slope(bx, by) > 0.75) continue // not on sheer cliffs
      const near = 1 - THREE.MathUtils.clamp((by + 14) / 76, 0, 1) * 0.35
      const bankBias = THREE.MathUtils.clamp(1.5 - (ad - 3.5) / 20, 0.45, 1)
      if (rand() > near * bankBias) continue
      placed.push({ x: bx, y: by, s: 0.55 + rand() * 0.8, hy: 0.8 + rand() * 0.45, r: rand() * Math.PI * 2 })
    }
    const im = new THREE.InstancedMesh(geomMat.g, geomMat.m, placed.length)
    im.castShadow = false
    im.receiveShadow = true
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
    placed.forEach((it, i) => {
      p.set(it.x, floorH(it.x, it.y), -it.y)
      q.setFromAxisAngle(up, it.r)
      sc.set(it.s, it.s * it.hy, it.s)
      M.compose(p, q, sc)
      im.setMatrixAt(i, M)
    })
    im.instanceMatrix.needsUpdate = true
    im.computeBoundingSphere()
    return im
  }, [geomMat])

  return <primitive object={mesh} />
}

// Pink wildflowers in scattered patches (the reference's foreground meadows),
// denser near the camera. Each is a little crossed billboard, green stem to pink
// petal, wind-swayed on the shared clock. Instanced -> one draw call.
function FlowerField() {
  const geomMat = useMemo(() => {
    const green = new THREE.Color('#4a7a2e'), pink = new THREE.Color('#ea72a6')
    const w0 = 0.02, w1 = 0.1, h = 0.42
    const pos: number[] = [], col: number[] = [], aH: number[] = [], idx: number[] = []
    let v = 0
    for (const ang of [0, Math.PI / 2]) {
      const c = Math.cos(ang), s = Math.sin(ang)
      const quad = [[-w0 * c, 0, -w0 * s], [w0 * c, 0, w0 * s], [-w1 * c, h, -w1 * s], [w1 * c, h, w1 * s]]
      const cols = [green, green, pink, pink], hs = [0, 0, 1, 1]
      for (let k = 0; k < 4; k++) {
        pos.push(quad[k][0], quad[k][1], quad[k][2])
        aH.push(hs[k])
        col.push(cols[k].r, cols[k].g, cols[k].b)
      }
      idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3)
      v += 4
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    g.setAttribute('aH', new THREE.Float32BufferAttribute(aH, 1))
    g.setIndex(idx)
    g.computeVertexNormals()
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0, side: THREE.DoubleSide })
    m.onBeforeCompile = (sh) => injectWind(sh, 'aH * aH', 0.14, 'attribute float aH;')
    return { g, m }
  }, [])

  const mesh = useMemo(() => {
    const rand = mulberry32(23)
    const placed: { x: number; y: number; s: number; r: number }[] = []
    let patches = 0
    while (patches < 160 && placed.length < 2400) {
      patches++
      const px = -40 + rand() * 80, py = -12 + rand() * 72
      const near = 1 - THREE.MathUtils.clamp((py + 12) / 72, 0, 1) * 0.6 // denser near camera
      if (rand() > near) continue
      if (slope(px, py) > 0.6) continue
      const n = 6 + Math.floor(rand() * 12)
      for (let k = 0; k < n && placed.length < 2400; k++) {
        const a = rand() * 6.28, r = rand() * 1.6
        const fx = px + Math.cos(a) * r, fy = py + Math.sin(a) * r
        if (Math.abs(fx - channelX(fy)) < channelHalf(fy) + 0.3) continue
        if (slope(fx, fy) > 0.7) continue
        placed.push({ x: fx, y: fy, s: 0.6 + rand() * 0.7, r: rand() * 6.28 })
      }
    }
    const im = new THREE.InstancedMesh(geomMat.g, geomMat.m, placed.length)
    im.castShadow = false
    im.receiveShadow = false
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
    placed.forEach((it, i) => {
      p.set(it.x, floorH(it.x, it.y), -it.y)
      q.setFromAxisAngle(up, it.r)
      sc.setScalar(it.s)
      M.compose(p, q, sc)
      im.setMatrixAt(i, M)
    })
    im.instanceMatrix.needsUpdate = true
    im.computeBoundingSphere()
    return im
  }, [geomMat])

  return <primitive object={mesh} />
}

// Layered haze: a few soft, camera-facing planes stepped back through the
// valley, dense near the ground and fading up. Each veils the props behind it,
// so mountains and floating islands read as progressively further away — the
// cheap "volumetric" depth cue on top of the scene's exponential fog.
function MistBands() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color('#f7d6ad') } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform vec3 uColor;
          void main(){
            float v = smoothstep(1.0, 0.2, vUv.y);
            float h = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
            gl_FragColor = vec4(uColor, v * h * 0.55);
          }`,
      }),
    [],
  )
  const bands = [
    { z: -58, y: 3, w: 170, h: 22 },
    { z: -92, y: 7, w: 250, h: 34 },
  ]
  return (
    <>
      {bands.map((b, i) => (
        <mesh key={i} position={[0, b.y, b.z]} material={mat} renderOrder={2}>
          <planeGeometry args={[b.w, b.h]} />
        </mesh>
      ))}
    </>
  )
}

// warm sunset gradient dome (hot peach horizon -> lilac zenith) with a bright
// warm hotspot along the sun direction: a broad halo plus a hot near-white core
// that pushes above the shared bloom threshold so the sun glows and blooms.
function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color('#a9a2d0') },
          mid: { value: new THREE.Color('#f4b58c') },
          bot: { value: new THREE.Color('#ffd8ad') },
          glow: { value: new THREE.Color('#fff2d6') },
          sunDir: { value: SUN_DIR },
        },
        vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 glow; uniform vec3 sunDir;
          void main(){ vec3 dir=normalize(vP); float h=clamp(dir.y*0.5+0.5,0.0,1.0);
            vec3 c = h<0.5 ? mix(bot,mid,h*2.0) : mix(mid,top,(h-0.5)*2.0);
            float s = max(dot(dir, sunDir), 0.0);
            c += glow * pow(s, 5.0) * 0.9;    // broad warm haze glow
            c += glow * pow(s, 140.0) * 2.6;  // hot core -> exceeds bloom threshold
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

  // patch foliage materials once so trees/plants sway in the breeze
  useMemo(() => {
    byKey.forEach((scene, key) => {
      if (!FOLIAGE.has(key)) return
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach(foliageWind)
      })
    })
  }, [byKey])
  useFrame((_, dt) => { if (!frozen) windTime.value += dt })

  const all = useMemo(
    () => [...BACKGROUND, ...FLOATERS, ...TREES, ...ROCKS, ...BRIDGES, ...LILIES, ...detail],
    [detail],
  )

  return (
    <>
      <fogExp2 attach="fog" args={['#f2c39a', 0.008]} />
      <SkyDome />
      <MistBands />
      {/* the sun disc itself: a bright warm sphere far along SUN_DIR, unfogged so
          the haze can't dim it; sits upper-right of frame and blooms */}
      <mesh position={SUN_DIR.clone().multiplyScalar(300).toArray()}>
        <sphereGeometry args={[16, 24, 24]} />
        <meshBasicMaterial color="#fff1d0" fog={false} toneMapped={false} />
      </mesh>
      <hemisphereLight args={['#ffdcb0', '#4e6a32', 0.55]} />
      <ambientLight intensity={0.22} color="#ffca92" />
      <directionalLight
        ref={sun}
        castShadow
        position={SUN_DIR.clone().multiplyScalar(80).toArray()}
        intensity={3.2}
        color="#ffb765"
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
      <GrassField />
      <FlowerField />
      {all.map((p, i) => {
        const s = byKey.get(p.asset)
        return s ? <Prop key={i} scene={s} p={p} /> : null
      })}
    </>
  )
}
