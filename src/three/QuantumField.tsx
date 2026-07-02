// Spacetime terrain: the live GPE sim rendered as a waterfall surface.
// x = space, z = time history flowing away from the camera, y = spin density.
// Domain walls (spin = 0) fall to near-black fault lines between lit domains.
//
// Render path: spin history lives in a float DataTexture; the vertex shader
// displaces a static plane and derives smooth normals from neighbor texels,
// the fragment shader does the abyssal palette plus specular/fresnel water
// shading. No per-frame CPU geometry writes.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createSim } from '../sim/gpe'

const N = 256 // sim grid = terrain columns
const M = 128 // history rows
const WIDTH = 30
const DEPTH = 46
const HEIGHT = 1.6

const STEPS_PER_FRAME = 6
const ROW_EVERY = 3 // frames between history rows
const QUENCH_AT = 0 // cycle timeline (seconds)
const UNQUENCH_AT = 26
const CYCLE = 34

// Abyssal palette (see docs/superpowers/specs/2026-07-02-condensate-fluid-render-design.md)
const BASE = '#050a14' // domain walls fall to this
const UP_DEEP = '#1e6f8f'
const UP_CREST = '#4fd8c8'
const DOWN_DEEP = '#7a4a1e'
const DOWN_CREST = '#f0a848'
const LIGHT_COLOR = '#cfe8ff' // cold key light

const vertexShader = /* glsl */ `
uniform sampler2D uSpin;
uniform float uHead;
varying float vSpin;
varying float vAge; // 0 = newest row (near edge), 1 = oldest
varying vec3 vNormal;
varying vec3 vViewDir;
#include <fog_pars_vertex>

const float GN = ${N.toFixed(1)};
const float GM = ${M.toFixed(1)};
const float DX = ${(WIDTH / (N - 1)).toFixed(6)};
const float DZ = ${(DEPTH / (M - 1)).toFixed(6)};
const float H = ${HEIGHT.toFixed(4)};

// uv.y = 1 at the far edge (oldest), 0 at the near edge (newest).
// History rows live in a ring buffer; uHead is the newest row.
float spinAt(float col, float age) {
  float row = mod(uHead - age + 2.0 * GM, GM);
  return texture2D(uSpin, vec2((col + 0.5) / GN, (row + 0.5) / GM)).r;
}

void main() {
  float col = uv.x * (GN - 1.0);
  float age = uv.y * (GM - 1.0);
  float s = spinAt(col, age);
  vec3 transformed = position + vec3(0.0, s * H, 0.0);

  // smooth heightfield normal from neighbor texels
  float hL = spinAt(max(col - 1.0, 0.0), age) * H;
  float hR = spinAt(min(col + 1.0, GN - 1.0), age) * H;
  float hNear = spinAt(col, max(age - 1.0, 0.0)) * H; // younger row, larger z
  float hFar = spinAt(col, min(age + 1.0, GM - 1.0)) * H;
  float dhdx = (hR - hL) / (2.0 * DX);
  float dhdz = (hNear - hFar) / (2.0 * DZ);
  vNormal = normalize(vec3(-dhdx, 1.0, -dhdz));

  vSpin = s;
  vAge = uv.y;
  vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
  vViewDir = cameraPosition - worldPos.xyz;
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uUpDeep;
uniform vec3 uUpCrest;
uniform vec3 uDownDeep;
uniform vec3 uDownCrest;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
varying float vSpin;
varying float vAge;
varying vec3 vNormal;
varying vec3 vViewDir;
#include <fog_pars_fragment>

void main() {
  float t = min(abs(vSpin), 1.0);
  vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 v = normalize(vViewDir);
  vec3 l = normalize(uLightDir);

  // domain bodies sit in the deep tone; the bright crest color lives on the
  // slopes where a domain rises out of a wall (bioluminescent surf line)
  vec3 deep = vSpin >= 0.0 ? uUpDeep : uDownDeep;
  vec3 crest = vSpin >= 0.0 ? uUpCrest : uDownCrest;
  vec3 albedo = mix(uBase, deep * 0.55, pow(t, 0.8)); // walls sink to near-black
  float slope = 1.0 - n.y;
  float surf = smoothstep(0.12, 0.65, slope) * t;

  float diffuse = 0.45 + 0.55 * max(dot(n, l), 0.0);
  float spec = pow(max(dot(n, normalize(l + v)), 0.0), 96.0);
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float fade = 1.0 - vAge * 0.55; // older rows dim before fog takes over

  vec3 color = albedo * diffuse;
  color += crest * surf * 1.1; // glowing domain edges
  color += uLightColor * spec * (0.3 + 0.7 * t); // wet glint
  color += uUpCrest * fresnel * 0.12; // cold rim against the void
  color *= fade;

  gl_FragColor = vec4(color, 1.0);
  #include <fog_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export function QuantumField({ frozen = false }: { frozen?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const state = useMemo(() => {
    const sim = createSim({ n: N, damping: 0.03, seed: 1 })
    sim.quench()
    const history = new Float32Array(M * N) // ring buffer of spin rows
    const texture = new THREE.DataTexture(history, N, M, THREE.RedFormat, THREE.FloatType)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    if (frozen) {
      // reduced motion: show fully formed domains, then never step again
      sim.step(3000)
      for (let j = 0; j < M; j++) history.set(sim.spin, j * N)
    }
    texture.needsUpdate = true
    return { sim, history, texture, head: 0, frame: 0, cycleT: 0, cycle: 0, quenched: true }
  }, [frozen])

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, N - 1, M - 1)
    geo.rotateX(-Math.PI / 2)
    geo.computeBoundingSphere()
    geo.boundingSphere!.radius += HEIGHT // displacement happens in the shader
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
          uSpin: { value: state.texture },
          uHead: { value: state.head },
          uBase: { value: new THREE.Color(BASE) },
          uUpDeep: { value: new THREE.Color(UP_DEEP) },
          uUpCrest: { value: new THREE.Color(UP_CREST) },
          uDownDeep: { value: new THREE.Color(DOWN_DEEP) },
          uDownCrest: { value: new THREE.Color(DOWN_CREST) },
          uLightDir: { value: new THREE.Vector3(-0.35, 0.9, 0.5).normalize() },
          uLightColor: { value: new THREE.Color(LIGHT_COLOR) },
        },
        fog: true,
        side: THREE.DoubleSide,
      }),
    [state]
  )

  useFrame((_, delta) => {
    if (frozen) return
    const st = state
    st.cycleT += delta
    if (st.quenched && st.cycleT >= UNQUENCH_AT) {
      st.sim.unquench()
      st.quenched = false
    }
    if (st.cycleT >= CYCLE) {
      st.cycle += 1
      st.cycleT = QUENCH_AT
      st.sim.quench(1 + st.cycle * 7919)
      st.quenched = true
    }
    st.sim.step(STEPS_PER_FRAME)
    st.frame += 1
    if (st.frame % ROW_EVERY === 0) {
      st.head = (st.head + 1) % M
      st.history.set(st.sim.spin, st.head * N)
      st.texture.needsUpdate = true
      material.uniforms.uHead.value = st.head
    }
  })

  return <mesh ref={mesh} geometry={geometry} material={material} position={[0, -1.2, -8]} />
}
