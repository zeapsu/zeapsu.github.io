import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { explorePrototype as copy } from '../content/data'
import type { Selection, StationId } from './navigation'

const ExploreCanvas = lazy(() => import('./ExploreCanvas'))
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

export function ExploreVisual({ station, hover, dark, onSelect, onHover }: { station: Selection; hover: Selection; dark: boolean; onSelect: (station: Selection) => void; onHover: (station: Selection) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const research = useRef<HTMLButtonElement>(null)
  const robotics = useRef<HTMLButtonElement>(null)
  const [webgl, setWebgl] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const motion = () => setReduced(media.matches)
    const visibility = () => setPageVisible(!document.hidden)
    motion(); visibility()
    media.addEventListener('change', motion)
    document.addEventListener('visibilitychange', visibility)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    if (container.current) observer.observe(container.current)
    try {
      const gl = document.createElement('canvas').getContext('webgl2')
      setWebgl(Boolean(gl))
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch { setWebgl(false) }
    return () => { media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); observer.disconnect() }
  }, [])
  const live = webgl && !reduced && visible && pageVisible && !failed
  const ids: StationId[] = ['research', 'robotics']
  return <div className={`x-scene ${live ? 'x-scene-live' : 'x-scene-flat'}`} ref={container} data-scene={live ? 'webgl' : 'flat'}>
    <p className="sr-only">{live ? copy.sceneDescription : copy.reducedDescription}</p>
    {live && <SceneBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}><ExploreCanvas station={station} hover={hover} dark={dark} labels={{ research, robotics }} onSelect={onSelect} onHover={onHover} onFailure={() => setFailed(true)} /></Suspense></SceneBoundary>}
    <div className="x-stations">{ids.map(id => <button key={id} ref={id === 'research' ? research : robotics} className={`x-station x-station-${id}`} data-station={id} aria-pressed={station === id} onClick={() => onSelect(id)} onPointerEnter={() => onHover(id)} onPointerLeave={() => onHover(null)} onFocus={() => onHover(id)} onBlur={() => onHover(null)}><span>{copy.stations[id].label}</span><small>{copy.stations[id].shortTitle}</small><span className="x-station-arrow" aria-hidden="true">↗</span></button>)}</div>
  </div>
}
