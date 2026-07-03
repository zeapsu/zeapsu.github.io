import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { QuantumField } from './three/QuantumField'
import { ProjectStations } from './three/ProjectStations'
import { JourneyCamera } from './three/JourneyCamera'
import { bloomOk, maxDpr } from './three/quality'
import { PAGES } from './layout'
import { Sections, StaticFallback } from './ui/Sections'

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const reducedMotion =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

const bloom = typeof document !== 'undefined' && bloomOk()

export default function App() {
  if (!webglAvailable()) return <StaticFallback />
  return (
    <>
      <Canvas dpr={[1, maxDpr()]} camera={{ fov: 55, near: 0.1, far: 90 }}>
        <color attach="background" args={['#0b0a12']} />
        <fog attach="fog" args={['#0b0a12', 16, 48]} />
        <ScrollControls pages={PAGES} damping={reducedMotion ? 0 : 0.18}>
          <JourneyCamera frozen={reducedMotion} />
          <QuantumField frozen={reducedMotion} />
          <ProjectStations frozen={reducedMotion} />
          <Stars
            radius={60}
            depth={40}
            count={2200}
            factor={3}
            saturation={0.4}
            fade
            speed={reducedMotion ? 0 : 0.6}
          />
          <Scroll html style={{ width: '100%' }}>
            <Sections />
          </Scroll>
          {bloom && (
            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.72} intensity={0.5} mipmapBlur />
            </EffectComposer>
          )}
        </ScrollControls>
      </Canvas>
      <div className="rail" aria-hidden="true">
        <div className="rail-fill" />
      </div>
    </>
  )
}
