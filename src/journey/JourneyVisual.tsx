import { Component, lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { houseJourney as copy } from '../content/data'
import type { JourneyState } from './path'
const JourneyCanvas = lazy(() => import('./JourneyCanvas'))
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}
export default function JourneyVisual({ state, chapter, dark, onDetails }: { state: RefObject<JourneyState>; chapter: number; dark: boolean; onDetails: (chapter: number) => void }) {
  const [webgl, setWebgl] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [visible, setVisible] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const motion = () => setReduced(media.matches)
    const visibility = () => setVisible(!document.hidden)
    motion(); visibility()
    media.addEventListener('change', motion); document.addEventListener('visibilitychange', visibility)
    try { const gl = document.createElement('canvas').getContext('webgl2'); setWebgl(Boolean(gl)); gl?.getExtension('WEBGL_lose_context')?.loseContext() } catch { setWebgl(false) }
    return () => { media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  const live = webgl && !reduced && !failed
  return <div className="j-world" data-scene={live ? 'webgl' : 'flat'}>
    <p className="sr-only">{live ? copy.sceneDescription : copy.flatDescription}</p>
    {live && <SceneBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}><JourneyCanvas state={state} chapter={chapter} dark={dark} active={visible} onDetails={onDetails} onFailure={() => setFailed(true)} /></Suspense></SceneBoundary>}
    {!live && <div className="j-flat" aria-hidden="true"><span>{copy.chapters[chapter].label}</span></div>}
  </div>
}
