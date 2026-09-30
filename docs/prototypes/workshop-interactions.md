# Two-station workshop interaction study

Local review route: `http://127.0.0.1:4175/?explore=1`. Branch `prototype/workshop-interactions`, isolated from main and the preserved rejected `prototype/fantasy-workshop` branch. Nothing is pushed or deployed. Default, plain and earlier workshop routes retain their implementations.

## Review the experience

Start with two explicitly labeled stations in one workshop. Hover/focus Research to open the notebook and brighten its lamp. Robotics responds with head/arm movement. Click a label or the station itself to focus the camera and open the matching DOM project panel. The same canvas stays mounted while switching stations. There is no free-roam, scroll journey, cinematic entry or separate world per discipline.

Use the persistent project navigation to switch directly, return to Overview, or open a different project from the panel. Browser Back and Escape restore the preceding project/overview state. A deep link such as `?explore=1&station=research` opens the correct panel; its first Escape returns to Overview without leaving the site. The visible Back control uses the same history behavior.

Work, the current General résumé and Contact are always available in the header. Keyboard skip navigation leads to native station buttons. Enter selects; the project heading receives focus. Returning to Overview restores station-navigation focus. Panels are labeled content sections, not modal dialogs, so project navigation and résumé remain reachable.

Mobile uses a focused scene above a readable project panel. Overview station labels are spaced to avoid touch-target collisions; the project navigation remains a direct switching option. Reduced motion, no WebGL and context loss use native project selectors with the same project content and history. No optional 3D runtime loads for the initial reduced/no-WebGL view.

## Content and art boundary

Research describes extending, testing and optimizing Dr. Hurst’s engine and reproducible Slurm/HDF5/SQLite tooling. It credits original engine authorship and omits unpublished physical findings and numerical speedup claims. Robotics uses existing cleared Reachy descriptions and actual hardware/interface images. The General résumé is the unchanged reviewed PDF. No private provenance, partner content, messages, photographs or reference-site assets were copied.

The reference informed the persistent-world/camera-focus/hotspot/detail/navigation model. This is an original simple-geometry study, not a final art pass. Warm wood, cool depth and restrained colors leave room for the requested Genshin-inspired treatment after the UX review. The earlier decorative GLB/render is not used by the explore route; no new Blender or generation work was done.

## Verification and limits

The real Chromium capture/check script is outside the worktree in task-4/output/explore-qa.mjs. It exercises desktop 1440×900 and mobile 390×844, both at DPR 2; both themes; actual notebook geometry response; camera movement; canvas persistence during direct switching; browser Back/Escape and focus; keyboard-only selection; mobile taps and panel-to-panel navigation; reduced motion/no-WebGL; context loss; and deep links. It also checks no horizontal overflow, non-overlapping mobile overview labels, actual project images and the exact served General PDF bytes.

The final run passed all 18 scenarios and eight interaction flows, with no console errors or failed HTTP responses. TypeScript, the content/palette self-check and the production Vite build passed. Lint passed with the pre-existing dispersion hook warning. The served résumé was byte-for-byte identical to the reviewed 43,711-byte General PDF.

A bounded overview performance probe on headless Chromium, Apple M4/Metal at DPR 2 rendered 120 frames in 1,999.6 ms (60.012 fps), p95 frame interval 17.7 ms. Renderer reported 132 draw calls and 6,320 triangles including shadows. Normal rendering is on demand; offscreen/hidden-page gating avoids rendering. This does not establish real-phone, Safari/iOS, network-loading or battery performance.

The existing shared Three/R3F chunk remains above Vite’s 500 kB warning threshold; it is deferred. Existing lint hook and Three.Clock deprecation warnings remain. No release or finished-art claim is made.

Shared installed dependencies are linked locally without an install. Vite’s development file allow list includes only the worktree root and resolved package directory so packaged fonts load. See [Vite server file serving](https://vite.dev/config/server-options.html#server-fs-allow). Network binding stays 127.0.0.1.

Actual browser screenshots and structured evidence live outside the worktree in task-4/output/explore-preview. Native Library attachment delivery remains unavailable through the earlier failed required route; local paths are not iOS delivery links.
