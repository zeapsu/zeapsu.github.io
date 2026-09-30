import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { WorkshopStudy } from './WorkshopStudy'
import { getWorkshopAsset } from './asset'

const WorkshopCanvas = lazy(() => import('./WorkshopCanvas'))

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function WorkshopVisual({ dark }: { dark: boolean }) {
  const asset = getWorkshopAsset()
  const model = asset?.model
  const container = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [webgl, setWebgl] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  useEffect(() => {
    if (!model) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(media.matches)
    const updateVisibility = () => setPageVisible(!document.hidden)
    updateMotion()
    updateVisibility()
    media.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    if (container.current) observer.observe(container.current)
    try {
      const gl = document.createElement('canvas').getContext('webgl2')
      setWebgl(Boolean(gl))
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch { setWebgl(false) }
    return () => {
      media.removeEventListener('change', updateMotion)
      document.removeEventListener('visibilitychange', updateVisibility)
      observer.disconnect()
    }
  }, [model])
  const staticScene = asset
    ? <img className="w-scene-poster" src={asset.poster} alt="The original fantasy workshop, rendered in Blender." width="1600" height="1200" />
    : <WorkshopStudy />
  const render3d = asset && visible && webgl && pageVisible && !reducedMotion && !failed
  return <div className="w-scene" ref={container} data-scene={render3d ? 'webgl' : asset ? 'poster' : 'composition-study'}>
    <div className="w-static-scene" style={{ visibility: render3d && ready ? 'hidden' : 'visible' }}>{staticScene}</div>
    {render3d && <div className="w-canvas" style={{ opacity: ready ? 1 : 0 }}><SceneBoundary fallback={null} onFailure={() => setFailed(true)}><Suspense fallback={null}><WorkshopCanvas asset={asset} dark={dark} onReady={onReady} onFailure={() => setFailed(true)} /></Suspense></SceneBoundary></div>}
  </div>
}
