import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/spectral/300.css'
import '@fontsource/spectral/300-italic.css'
import '@fontsource/spectral/400.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
const DefaultApp = lazy(() => import('./App.tsx'))

// Local aesthetic review only. The shipped portfolio remains the default.
const parameters = new URLSearchParams(location.search)
const Root = parameters.has('journey')
  ? lazy(() => import('./journey/HouseJourney'))
  : parameters.has('explore')
  ? lazy(() => import('./explore/ExplorePrototype'))
  : parameters.has('workshop') ? lazy(() => import('./workshop/WorkshopPrototype')) : DefaultApp

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
