# Fantasy-house scroll journey blockout

Local-only branch: `prototype/house-scroll-journey`. The previous station study and decorative hero are preserved. No push, merge, deployment, package installation or asset-service use occurred.

## Implemented route

Native, reversible scrolling controls one connected valley/bridge/house. Chapter shortcuts use the same state, focus the associated DOM heading and create deliberate history entries. Passive scrolling does not steal focus. The six chapters are valley, approach, framed gallery/about, research study/bookshelf, robot workbench and contact book/reset.

All content stays in semantic DOM sections. Project details are native disclosures; Escape closes a disclosure and returns focus to its summary. Résumé and Contact are always available. Mobile uses a persistent scene above readable panels and chapter select/previous/next controls. Reduced motion and unavailable WebGL use ordered DOM chapters without requesting the optional Canvas module. Context loss restores those same readable chapters.

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

## Actual verification and review limits

The completed real Chromium run passed 31 scenarios and seven core interaction groups: six chapter shortcuts with heading focus and one persistent Canvas; browser Back; native forward/reverse scrolling and house entry; Contact reset; keyboard disclosures and Escape with focus restoration; 390px touch/chapter controls in both themes; and all six chapters, project details and reset under reduced motion or without WebGL. Context loss also restores the readable fallback. There were no browser errors, failed HTTP responses or horizontal overflow. Project images loaded, and the served résumé matched the bytes and SHA256 above.

The structural route check sampled 501 camera positions against the actual wall, roof and doorway bounds with a 0.12-unit clearance margin and found no collisions. Actual exterior, entry, gallery, research, book and mobile captures were inspected. This is a camera and interaction blockout: procedural surfaces, furniture, lighting and the exposed exterior gable still need the later art pass. No finished-art or physical-device approval is implied.

App and tooling TypeScript checks, the content/palette selfcheck and a production Vite bundle all passed. Oxlint passed with two nonblocking warnings: the lazy bootstrap component's Fast Refresh export warning and the existing dispersion hook dependency warning. The bundle retains the shared lazy Three/R3F chunk-size warning.

A short headless Chromium probe on Apple M4/Metal at DPR 2 rendered 120 frames in 2,000.3 ms, approximately 60 fps, with a 16.7 ms median and 18.5 ms 95th-percentile frame interval. It reported 357 draw calls and 8,992 rendered triangles. This does not establish sustained performance, mobile hardware or Safari compatibility. These measurements belong to this journey, rather than the previous station study.

The earlier compiler, bundle and fresh-load stalls were traced to an offloaded dependency copy: its Vite entry and TypeScript files were marked `dataless`. The verified recovery uses an exact committed-source snapshot and an already installed, fully local dependency tree with the identical package-lock hash. It required no package download or source/configuration change. Type checks took 1.65 seconds and 0.39 seconds; the bundle completed in 0.77 seconds and Vite started in 132 ms. The old stalled preview is superseded.

Working local review address: `http://127.0.0.1:4177/?journey=1`. It serves the verified snapshot, not live edits in the original worktree. The review configuration has file watching disabled and an isolated dependency cache; intentional edits require a controlled snapshot refresh/restart. Network binding remains 127.0.0.1. Review evidence and screenshots are outside Git in task-4/output/journey-preview; `verification.json` is the completed run. Native Library attachment delivery remains unavailable, so these local artifacts are not iOS download links.
