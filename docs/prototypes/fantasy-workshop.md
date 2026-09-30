# Fantasy workshop: bounded local prototype

Open `http://127.0.0.1:4174/?workshop=1` with the local dev server on port 4174. This query selects the prototype; the default portfolio and `?plain=1` retain their existing behavior. Nothing has been pushed or deployed.

## Art direction

The approved direction is an original fantasy workshop with Genshin Impact inspired stylization. Use a fixed oblique view, an arched window, warm wood, broad painterly color areas, brass details and cool ambient depth. A warm lamp and one restrained scientific/magical object provide the focal light. Preserve the real portrait; do not invent an avatar or copy game assets, characters or logos.

The scene occupies the right side of a warm-paper or deep-blue hero. The left side states the name and introduction and exposes Work and Résumé actions. Contact is in the navigation. Mobile places the introduction and actions before the scene. One Reachy row follows, using the existing real hardware photo and actual controller screenshot with native-dialog enlargement.

Scope is one hero and one case study. No walking, cinematic entry, room switching, character carousel, scroll camera or resurrected simulation.

## Current state and handoff

The visible artwork is explicitly labeled as a temporary SVG composition study. The native Blender scene owner has not supplied a confirmed GLB/render. `getWorkshopAsset()` therefore returns `null`; the preview does not fetch a 3D runtime or invent an asset. Add the inspected model, actual poster render and camera to `src/workshop/asset.ts` after handoff. Keep any private orchestration notes and source/provenance documents outside the web repository.

The prepared loader uses a fixed camera, demand rendering, DPR capped at 2, visibility gating and a static poster for reduced motion, unavailable WebGL or context loss. It has passed compilation but cannot be visually or performance validated until the actual asset arrives. Model target: below 2 MB, 100k visible triangles and 2K textures, subject to measurement.

The résumé control explicitly identifies the existing published July CV. A reviewed current General PDF is still needed before release. The prototype copy uses bounded systems/robotics experience; a full skills section remains outside this study while its separate evidence review finishes.

## Validation

Build and content/palette selfcheck pass. Lint reports only the pre-existing `dispersion.ts` hook dependency warning. Real Chromium captures cover desktop at 1440×900/DPR 2, mobile 390×844/DPR 2, both themes, reduced motion and unavailable WebGL for the current composition. The capture script also checks no horizontal overflow, immediate mobile actions, keyboard skip navigation, case-study anchor navigation, native-modal focus/escape/return, the explicitly labeled existing PDF response, and unchanged default/plain routes.

No current 3D FPS, GLB appearance or asset fallback result is claimed. Those checks are pending the actual handoff. Screenshots and verification data remain outside the git worktree.
