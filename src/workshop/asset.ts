export interface WorkshopAsset {
  model: string
  poster: string
  camera: [number, number, number]
  target: [number, number, number]
  orthographic?: boolean
  zoom?: number
  viewHeight?: number
  normalize?: boolean
}

// Original native-owner GLB/render inspected before integration. Blender's
// (x,y,z) maps to glTF (x,z,-y). Remove the original full-hero horizontal shift
// because this canvas occupies only the right-hand scene column.
const asset: WorkshopAsset = {
  model: '/workshop/fantasy-workshop.glb',
  poster: '/workshop/fantasy-workshop-preview.png',
  camera: [6.8, 7.3, 10],
  target: [0, 1.73, 0],
  orthographic: true,
  viewHeight: 4.95,
}

export function getWorkshopAsset(): WorkshopAsset | null {
  return asset
}
