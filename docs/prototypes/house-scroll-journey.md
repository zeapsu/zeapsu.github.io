# Fantasy-house scroll journey blockout

Local-only branch: `prototype/house-scroll-journey`. The previous station study and decorative hero are preserved. No push, merge, deployment, package installation or asset-service use occurred.

## Implemented route

Native, reversible scrolling controls one connected valley/bridge/house. Chapter shortcuts use the same state, focus the associated DOM heading and create deliberate history entries. Passive scrolling does not steal focus. The six chapters are valley, approach, framed gallery/about, research study/bookshelf, robot workbench and contact book/reset.

All content stays in semantic DOM sections. Project details are native disclosures; Escape closes a disclosure and returns focus to its summary. Résumé and Contact are always available. Mobile uses a persistent scene above readable panels and chapter select/previous/next controls. Reduced motion, unavailable WebGL and context loss use ordered DOM chapters without requesting the optional Canvas module. Those fallback and history flows are implemented but the full current verification run remains incomplete.

## Camera and geometry contract

World uses Y up, front door at Z=6, house center X=0/Z=0, interior floor Y=0. Interior bounds are X ±6 and Z ±6. Doorway opening is X ±1.4, below Y=3.4. Camera stays on X=0 while crossing the doorway and only turns toward the gallery after reaching Z=4.4. Non-adjacent shortcuts/large scrollbar jumps snap to a safe route pose rather than interpolating diagonally through a wall.

| Stop/progress | Camera position | Target | FOV |
| --- | --- | --- | --- |
| Valley / 0 | 17, 11, 30 | 0, 2, 3 | 48 |
| Approach / 1 | 0, 2.5, 14 | 0, 2, 5.7 | 48 |
| Door approach / 1.32 | 0, 1.9, 8 | 0, 1.8, 3 | 48 |
| Inside threshold / 1.68 | 0, 1.9, 4.4 | -3.8, 1.9, 2 | 45 |
| Gallery / 2 | -0.5, 1.9, 2.8 | -5.7, 2, 1.7 | 45 |
| Research / 3 | -0.8, 2.05, 0.8 | -4.25, 1.4, -2.8 | 45 |
| Robotics / 4 | 1.8, 2.1, -0.7 | 4.1, 1.5, -3 | 45 |
| Contact / 5 | 0.2, 2.65, -1.1 | 0, 1.05, -4.3 | 45 |

These coordinates are blocking positions, not a locked art brief. Exterior rocks/trees, bridge/rails, roof/chimney smoke, wall frames, shelves, study notebook, robot/controller, cooking pot/steam, fireplace and open book are procedural geometry. No detailed Blender work was done. The reference pixels were inspected earlier; no game screenshot, UID, asset or private partner content was imported into the site.

## Cleared content

The approved General résumé PDF remains unchanged at `/resume/Andry_Paez_general.pdf` (43,711 bytes, SHA256 `1f939935eef0bd72fa76eb87492646c5f86255c895a60fb68b993f478d6bd2fc`). Research credits Dr. Hurst’s original engine and describes engineering/reproducibility contributions. Reachy uses existing cleared descriptions and actual project images. The brief skills list is a conservative subset for this layout study, not a final skills audit. Frames do not imply certifications. No unpublished results, invented graphs, metrics or seniority were added.

## Actual verification and blocker

A real Chromium six-view probe at 1440×900, DPR 2, no reduced motion captured every chapter, checked the expected camera positions and focused heading, observed one Canvas per view, found no horizontal overflow and recorded no console errors. The actual gallery, research, exterior, approach and book captures were visually inspected. A first interrupted Canvas capture was corrected by preserving the Canvas through visibility changes and pausing its frame loop instead.

Full checks for structural collision samples, native scroll reversal, browser Back, disclosure Escape, keyboard, 390px mobile, themes, reduced motion/no-WebGL/context loss, reset, résumé bytes and frame performance are scripted but have not completed successfully for this new journey. Do not transfer the earlier station study’s successful tests or 60 fps result to this scene.

The local execution environment produced repeated Vite notifications/restarts for unedited files. The journey review server now has file watching disabled and an isolated dependency cache. Intentional edits require a controlled restart of this server. The default portfolio is lazily imported so review does not eagerly load its unrelated modules. Network binding remains 127.0.0.1.

The fresh page-load check still exceeded 30 seconds after that controlled restart. TypeScript checks stalled (including a bounded 90-second check with the existing bundled runtime); a local production-bundle check exceeded 150 seconds. No compiler error was returned, and no successful build/type-check claim is made. The cause is not established. Further retry loops were stopped; preserving and handing off this exact checkpoint takes priority while connectivity/execution is unstable.

Preview address: `http://127.0.0.1:4176/?journey=1`. Vite reports listening, but a fresh successful application load is not currently verified. Existing actual screenshots and first-probe data are outside Git in task-4/output/journey-preview. The failed full-run diagnostic is there too. Native Library attachment delivery is unavailable; these local artifacts are not iOS download links.
