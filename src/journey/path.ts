export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3; fov: number }
export const chapterIds = ['valley', 'approach', 'about', 'research', 'robotics', 'contact'] as const
export type ChapterId = typeof chapterIds[number]

// A connected path through the front doorway. Intermediate entry poses keep
// the camera on the door axis until it is safely inside the room.
const stops: { at: number; pose: Pose }[] = [
  { at: 0, pose: { position: [17, 11, 30], target: [0, 2, 3], fov: 48 } },
  { at: 1, pose: { position: [0, 2.5, 14], target: [0, 2, 5.7], fov: 48 } },
  { at: 1.32, pose: { position: [0, 1.9, 8], target: [0, 1.8, 3], fov: 48 } },
  { at: 1.68, pose: { position: [0, 1.9, 4.4], target: [-3.8, 1.9, 2], fov: 45 } },
  { at: 2, pose: { position: [-.5, 1.9, 2.8], target: [-5.7, 2, 1.7], fov: 45 } },
  { at: 3, pose: { position: [-.8, 2.05, .8], target: [-4.25, 1.4, -2.8], fov: 45 } },
  { at: 4, pose: { position: [1.8, 2.1, -.7], target: [4.1, 1.5, -3], fov: 45 } },
  { at: 5, pose: { position: [.2, 2.65, -1.1], target: [0, 1.05, -4.3], fov: 45 } },
]
const mix = (a: Vec3, b: Vec3, t: number): Vec3 => a.map((v, i) => v + (b[i] - v) * t) as Vec3
export function poseAt(progress: number, aspect = 1.6): Pose {
  const p = Math.max(0, Math.min(5, progress))
  const index = stops.findIndex(stop => stop.at >= p)
  const right = stops[index < 0 ? stops.length - 1 : index]
  const left = stops[Math.max(0, index - 1)]
  const raw = right.at === left.at ? 0 : (p - left.at) / (right.at - left.at)
  const t = raw * raw * (3 - 2 * raw)
  const pose = { position: mix(left.pose.position, right.pose.position, t), target: mix(left.pose.target, right.pose.target, t), fov: left.pose.fov + (right.pose.fov - left.pose.fov) * t }
  // Narrow exterior framing uses height, without changing the entry route.
  if (p < 1 && aspect < 1) {
    const scale = 1 + (1 - p) * .35
    pose.position = mix(pose.target, pose.position, scale)
  }
  return pose
}

export type JourneyState = { progress: number; chapter: number; jump: boolean }
