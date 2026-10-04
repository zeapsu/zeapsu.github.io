# Learned Gaussian terrain experiment

A 2.8-metre synthetic grass, dirt, and rock patch trained with official
[Brush v0.3.0](https://github.com/ArthurBrussee/brush/releases/tag/v0.3.0)
on a MacBook Air M4 using Metal. Training used 24 images at 192 × 192, seed 42,
SH0, 2,000 iterations, and a 12,000-splat cap.

Four held-out cameras yielded mean PSNR **32.36 dB** and SSIM **0.908**.
Brush reported 12 seconds of training; the supervisor measured 15.32 seconds.
The model and video below are actual learned outputs.

- [Learned preview](terrain-learned-preview.mp4): 12 seconds, H.264, 960 × 720;
  orbit, representative cameras, and held-out comparisons.
- [Native learned PLY](terrain-trained-2000.ply): unchanged 12,000-Gaussian export.
- [Comparison image](terrain-heldout-comparison.png): reference, two-step pilot,
  and final trained result.
- [Results archive](terrain-training-results.tar.gz): native rendered views,
  camera definitions, metrics, logs, and scoped reproduction scripts.
- [Metrics](metrics.json), [publication manifest](publication-manifest.json),
  and [SHA256SUMS](SHA256SUMS).

The archive removes local account paths and internal Library identifiers.
Binary outputs, measured values, and camera matrices are unchanged. The original
archive hash and metadata edits are recorded for provenance.

Fine detail remains soft at this capture resolution. SH0 color is independent
of view direction. Four synthetic held-out cameras provide limited validation.
The video is an offline render; viewer speed, mobile framing, and full-scene
integration remain untested. Geometry is Blender-local Z-up despite the PLY
exporter's generic Y-up comment; the archive documents the camera matrices and
candidate coordinate mapping. These are isolated experimental assets.
