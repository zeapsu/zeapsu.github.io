export interface WorkshopAsset {
  model: string
  poster: string
  camera: [number, number, number]
  target: [number, number, number]
  orthographic?: boolean
  zoom?: number
  normalize?: boolean
}

// Populated only after the native owner's real GLB and render are inspected.
// An empty handoff cannot silently substitute an invented 3D asset.
export function getWorkshopAsset(): WorkshopAsset | null {
  return null
}
