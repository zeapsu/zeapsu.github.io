# Fantasy workshop: bounded local prototype

Open `http://127.0.0.1:4174/?workshop=1` on the Mac with the local dev server on port 4174. This query selects the prototype. The default portfolio and `?plain=1` retain their existing behavior. Nothing has been pushed or deployed.

## Appearance and scope

The approved direction is an original fantasy workshop with Genshin Impact inspired stylization: painted wood, broad color areas, brass details, warm lamp light and cool ambient depth. A fixed oblique view shows a desk, shelves, books, jars, a plant, quill and a small mineral resonator. There are no copied game assets, characters or logos.

The scene occupies the right side of a warm-paper or deep-blue hero. Real DOM text on the left states the name and introduction and exposes Work and the current General résumé. Contact is in the navigation. Mobile places the introduction and actions before the scene. The real portrait is preserved. One Reachy row follows, using existing actual hardware and interface images with native-dialog enlargement.

Scope is one hero and one case study. No walking, cinematic entry, room switching, character carousel, scroll camera or resurrected simulation. A full skills section remains outside this study.

## Actual assets and browser integration

The inspected original GLB is 2,165,680 bytes with 29,110 triangles, 162 meshes and eleven embedded 128×128 painted textures. It has no external image or buffer resources. This is slightly above the initial 2 MB model target; no optimization pass has been applied before aesthetic review. The actual 1440×960 transparent Blender render is the static fallback, framed with CSS without altering its pixels.

Blender coordinates map to glTF as `(x,y,z) → (x,z,-y)`. The browser camera is `[6.8,7.3,10]`, targeting `[0,1.73,0]`, orthographic with view height 4.95. The native full-hero horizontal shift is omitted because the browser has a separate scene column. Browser hemisphere/directional lights and AgX tone mapping restore warm/cool depth; imported punctual light intensity is scaled for the web renderer. Cycles lighting is not baked, so the browser and poster are visually consistent rather than pixel-identical.

The loader is deferred, uses demand rendering and caps DPR at 2. Offscreen/hidden-page gating avoids active rendering. Reduced motion, unavailable WebGL and context loss show the actual poster while all content and links remain usable. The model and optional canvas module are not requested under reduced motion or without WebGL. A development-only renderer handle supports measurements and is removed from the production build.

The hero opens the reviewed current General PDF directly. The footer labels it "General résumé (PDF)". Its copied and served bytes match the approved local output. No private source or provenance documents, orchestration files or Blender source are included in the website.

## Verification and limits

TypeScript compilation, Vite production build and content/palette selfcheck pass. Lint reports only the pre-existing `dispersion.ts` hook dependency warning. Vite reports the existing shared Three/R3F chunk above 500 kB; it remains optional and deferred. The current R3F/Three combination emits a Three.Clock deprecation warning, with no captured errors.

Real Chromium checks cover desktop 1440×900/DPR 2 and mobile 390×844/DPR 2 in both themes; reduced motion; no WebGL; context loss; and mobile scroll away/return. They check no horizontal overflow, immediate mobile actions, skip navigation, case-study anchor navigation, native-modal focus/escape/return, PDF response and exact bytes, and existing default/plain routes. Actual desktop, mobile and fallback captures were visually inspected. Screenshots and verification data are stored outside the git worktree.

A fixed-camera, continuous-render probe on headless Chromium using Apple M4/Metal at DPR 2 rendered 120 frames in 1,999.9 ms: approximately 60 fps, with a 17.5 ms 95th-percentile interval. Normal rendering is on demand. This is a bounded Mac measurement; other browsers, real phones, network loading and battery use have not been measured. Safari/iOS visual QA remains open.

The prototype is ready for aesthetic review. Release, broader page design and production optimization remain separate decisions.
