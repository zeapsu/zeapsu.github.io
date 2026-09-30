import { useCallback, useEffect, useState } from 'react'

export type StationId = 'research' | 'robotics'
export type Selection = StationId | null

function readStation(): Selection {
  const id = new URLSearchParams(location.search).get('station')
  return id === 'research' || id === 'robotics' ? id : null
}

export function useExploreNavigation() {
  const [view, setView] = useState<{ station: Selection; reason: 'initial' | 'select' | 'back' }>({ station: readStation(), reason: 'initial' })
  useEffect(() => {
    if (typeof history.state?.portfolioExploreDepth !== 'number') history.replaceState({ ...history.state, portfolioExploreDepth: 0 }, '', location.href)
    const pop = () => setView({ station: readStation(), reason: 'back' })
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])
  const select = useCallback((station: Selection, replace = false) => {
    if (station === readStation()) return
    const url = new URL(location.href)
    if (station) url.searchParams.set('station', station)
    else url.searchParams.delete('station')
    const depth = typeof history.state?.portfolioExploreDepth === 'number' ? history.state.portfolioExploreDepth : 0
    const state = { ...history.state, portfolioExploreDepth: replace ? depth : depth + 1 }
    if (replace) history.replaceState(state, '', url)
    else history.pushState(state, '', url)
    setView({ station, reason: replace ? 'back' : 'select' })
  }, [])
  const back = useCallback(() => {
    if (!readStation()) return
    if (history.state?.portfolioExploreDepth > 0) history.back()
    else select(null, true)
  }, [select])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && view.station) { event.preventDefault(); back() }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [back, view.station])
  return { ...view, select, back }
}
