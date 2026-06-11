Concatenate the five existing Clinic Copilot MP4s in `/mnt/documents/` into a single continuous video using ffmpeg (already in PATH, no re-render needed).

## Order

1. `clinic-copilot-intro.mp4` (15s brand intro)
2. `clinic-copilot-signin.mp4` (20s sign-in → dashboard)
3. `clinic-copilot-intake.mp4` (30s intake submission)
4. `clinic-copilot-agent-terminal.mp4` (20s agent terminal)
5. `clinic-copilot-dashboard-result.mp4` (25s dashboard result + closing)

Total: ~110s.

## Steps

1. Verify all 5 source files exist in `/mnt/documents/` and probe each with `ffprobe` to confirm matching resolution (1920×1080), fps (30), and codec (h264).
2. If all streams match: use ffmpeg concat demuxer with `-c copy` (stream copy, lossless, fast — no re-encode).
3. If any mismatch: re-encode with a single ffmpeg command using the concat filter to normalize to 1920×1080 / 30fps / h264 / yuv420p.
4. Output to `/mnt/documents/clinic-copilot-full.mp4`.
5. Probe the final file to confirm duration ≈ 110s and report path + size.

## Notes

- No Remotion rebuild — purely a post-process stitch of files already rendered.
- Filenames above are based on the render script history; will adjust if any are named differently on disk.
- No transitions added between segments (request was "continuous"); can add crossfades in a follow-up if desired.