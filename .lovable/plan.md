Confirm the same segment order (Intro → Sign in → Intake → Agent → Results), add title cards between segments and a persistent lower-third step label over each clip, and mix calm ambient background music underneath.

## Segment order (confirmed)

```
1. clinic-copilot-intro.mp4            (20s)  Intro
2. clinic-copilot-signin.mp4           (20s)  Sign in
3. clinic-copilot-intake-demo.mp4      (30s)  Submit intake
4. clinic-copilot-agent-terminal.mp4   (20s)  AI agent triage
5. clinic-copilot-dashboard-result.mp4 (25s)  Case routed
```

## On-screen text

- 1.5s title card before each non-intro segment: "Step 2 — Sign in", "Step 3 — Submit intake", "Step 4 — AI agent triage", "Step 5 — Case routed". Same slate/teal palette as the app; clean Inter type; fades in/out.
- Persistent lower-third pill in the bottom-left of every clip: small step label ("Step 2 · Sign in" etc.), low-opacity dark backdrop, soft fade in at clip start.

## Background music

- Generate a single ~2-minute calm professional ambient track via ElevenLabs Music (soft pads, gentle motion, medical/clinical feel).
- Mix at ~-22 LUFS so on-screen voice/UI cues read cleanly; fade in over 1.5s, fade out over 2s at the end.

## How it's built

- New Remotion composition `remotion/src/scenes/FullDemo.tsx` that uses `<OffthreadVideo>` for each MP4 (via `staticFile`) inside a `<Series>`, with 45-frame title cards between segments and a small `<Lowerthird>` overlay component shown for the duration of each video segment.
- Copy the 5 MP4s into `remotion/public/clips/` so `staticFile()` can serve them.
- Render at 1920×1080 / 30fps, muted video output, to `/mnt/documents/clinic-copilot-full_v2.mp4`.
- Generate music via ElevenLabs (link connector if not already linked) to `/tmp/bgm.mp3`.
- Final ffmpeg pass: take the rendered MP4 + `bgm.mp3`, apply `afade` in/out and `volume`, encode AAC, output to `/mnt/documents/clinic-copilot-full_v2.mp4` (overwriting the muted render).

## Technical notes

- Total length: ~115s video + 4 × 1.5s cards ≈ 121s.
- Music track generated slightly longer than video, trimmed with `-shortest`.
- If ElevenLabs is not connected, I'll pause and link the connector before generating.
- Keeps the original `clinic-copilot-full.mp4` intact; new file is `_v2`.