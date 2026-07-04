// The dev room: the Research SWE world, and the one fully-real zone. The real
// Hyprland rice (LazyVim, neofetch, Tokyo Night) glows on a large monitor that
// dominates the frame; a warm desk, tower, and keyboard sit in the foreground
// periphery. One real zone inoculates the site against "it's all cosplay":
// that screen is Andry's actual desktop, not set dressing.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../../sim/gpe'
import riceUrl from '../../assets/rice.jpg'

const BG = '#0a0705'
const RICE_ASPECT = 1698 / 945

// warm code-glyph motes drifting up in the desk-lamp light
function CodeMotes({ color }: { color: THREE.Color }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(5150)
    const count = 150
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 26
      pos[i * 3 + 1] = rand() * 12
      pos[i * 3 + 2] = -8 + (rand() - 0.5) * 14
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
          p.y = mod(p.y + uTime*(0.1+aSeed*0.14), 12.0);
          p.x += sin(uTime*0.2+aSeed*6.28)*0.5;
          vec4 mv = modelViewMatrix*vec4(p,1.0);
          gl_PointSize = min((1.0+aSeed*1.6)*(90.0/-mv.z), 3.5);
          vA = (0.06+aSeed*0.14)*clamp((-mv.z-3.0)/14.0,0.0,1.0);
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main(){ float d=length(gl_PointCoord-0.5); gl_FragColor=vec4(uColor*smoothstep(0.5,0.0,d)*vA,1.0);}`,
      uniforms: { uTime: { value: 0 }, uColor: { value: color } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry, material }
  }, [color])
  useFrame((_, d) => {
    material.uniforms.uTime.value += d
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

export function DevRoom({ frozen, up }: { frozen: boolean; up: string; down: string }) {
  const rice = useLoader(THREE.TextureLoader, riceUrl)
  useMemo(() => {
    rice.colorSpace = THREE.SRGBColorSpace
    rice.anisotropy = 8
  }, [rice])

  // A real Tokyo Night desktop is a dark image (bg ~#1a1b26, avg brightness
  // ~30/255): unlit at 1:1 it reads as black. A live panel's backlight makes
  // even a dark theme glow, so multiply the screen well above 1.0 -- the dark
  // bg lifts to a lit blue-grey, the bright text clips past 1.0 and blooms.
  const backlight = useMemo(() => {
    const c = new THREE.Color()
    c.r = 4.2; c.g = 4.2; c.b = 4.6
    return c
  }, [])

  const warm = useMemo(() => new THREE.Color(up), [up])
  const screenLight = useRef<THREE.PointLight>(null!)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (frozen) invalidate()
  }, [frozen, invalidate, up])

  useFrame(({ clock }) => {
    if (frozen) return
    if (screenLight.current) {
      // subtle flicker so the monitor reads as live, not a poster
      screenLight.current.intensity = 26 + Math.sin(clock.elapsedTime * 3.1) * 1.4
    }
  })

  const screenW = 16
  const screenH = screenW / RICE_ASPECT

  return (
    <>
      <color attach="background" args={[BG]} />
      <ambientLight intensity={0.4} />
      {/* warm desk-lamp key from the left */}
      <pointLight position={[-7, 8, 6]} intensity={55} distance={40} color={warm} />
      <pointLight position={[8, 4, 4]} intensity={22} distance={30} color={'#ff9a4a'} />
      {/* cool spill the monitor throws on the desk */}
      <pointLight ref={screenLight} position={[-1, 5, -6]} intensity={26} distance={26} color={'#9fc0ff'} />

      {/* floor + back wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -8]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={'#171009'} roughness={0.9} metalness={0.15} />
      </mesh>
      <mesh position={[0, 8, -14]}>
        <planeGeometry args={[80, 34]} />
        <meshStandardMaterial color={'#100c08'} roughness={1} />
      </mesh>

      {/* the monitor: the real rice, emissive so it glows and blooms. Angled
          toward the camera, dominating the right of frame. */}
      <group position={[2.5, 5, -9]} rotation={[0, -0.22, 0]}>
        {/* bezel sits BEHIND the screen: box depth 0.35 centred at z=-0.35 puts
            its front face at -0.175, clear of the screen plane at z=0 -- any
            closer and the bezel occludes the screen (renders it black). */}
        <mesh position={[0, 0, -0.35]}>
          <boxGeometry args={[screenW + 0.5, screenH + 0.5, 0.35]} />
          <meshStandardMaterial color={'#040404'} roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh>
          <planeGeometry args={[screenW, screenH]} />
          {/* unlit + toneMapped off + backlight multiplier = the rice glowing
              like a live panel; bloom catches the bright text and wallpaper */}
          <meshBasicMaterial map={rice} color={backlight} toneMapped={false} />
        </mesh>
        <mesh position={[0, -screenH / 2 - 1.6, 0.2]}>
          <boxGeometry args={[0.7, 3.2, 0.7]} />
          <meshStandardMaterial color={'#0a0a0a'} roughness={0.5} metalness={0.5} />
        </mesh>
      </group>

      {/* desk */}
      <mesh position={[0, 0.9, -6]}>
        <boxGeometry args={[26, 0.5, 9]} />
        <meshStandardMaterial color={'#2a1e14'} roughness={0.55} metalness={0.25} />
      </mesh>

      {/* PC tower with a warm accent bar, foreground left */}
      <group position={[-9.5, 2.6, -4.5]}>
        <mesh>
          <boxGeometry args={[3, 6, 6]} />
          <meshStandardMaterial color={'#161616'} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[1.52, 0, 0]}>
          <boxGeometry args={[0.06, 5, 0.35]} />
          <meshBasicMaterial color={warm} toneMapped={false} />
        </mesh>
      </group>

      {/* keyboard + underglow */}
      <mesh position={[0, 1.35, -3.6]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[9, 0.4, 2.6]} />
        <meshStandardMaterial color={'#1b1b1b'} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.12, -3.6]}>
        <boxGeometry args={[9.3, 0.1, 2.9]} />
        <meshBasicMaterial color={warm} toneMapped={false} />
      </mesh>

      <CodeMotes color={warm} />
    </>
  )
}
